const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;
const appointments = [];
const services = ["Haircut", "Haircut + Beard", "Beard Trim"];
const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM"
];
const pageTemplate = fs.readFileSync(
    path.join(__dirname, "public", "index.html"),
    "utf8"
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}

function isValidDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

function renderAppointments() {
    if (appointments.length === 0) {
        return '<p class="empty-state">No appointments booked yet. Your next great look starts here.</p>';
    }

    return appointments.map((appointment) => `
        <article class="appointment">
            <div class="appointment__top">
                <strong>${escapeHtml(appointment.name)}</strong>
                <span>${escapeHtml(appointment.service)}</span>
            </div>
            <p>${escapeHtml(appointment.date)} <span aria-hidden="true">·</span> ${escapeHtml(appointment.time)}</p>
            <p class="appointment__phone">Phone: ${escapeHtml(appointment.phone)}</p>
        </article>
    `).join("");
}

app.get("/", (req, res) => {
    const commitId = process.env.RENDER_GIT_COMMIT || "local";
    const page = pageTemplate
        .replace("{{APPOINTMENTS}}", renderAppointments())
        .replace("{{COMMIT_ID}}", escapeHtml(commitId));
    res.type("html").send(page);
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/appointments", (req, res) => {
    res.json(appointments);
});

app.post("/appointments", (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const { service, date, time } = req.body;
    const phoneDigits = phone.replace(/\D/g, "");

    if (
        name.length < 2 || name.length > 60 ||
        phoneDigits.length < 7 || phoneDigits.length > 15 ||
        !/^[+()\d\s.-]+$/.test(phone) ||
        !services.includes(service) ||
        !isValidDate(date) ||
        !timeSlots.includes(time)
    ) {
        return res.status(400).send("Please enter a valid name, phone number, service, date, and time.");
    }

    const alreadyBooked = appointments.some(
        (appointment) => appointment.date === date && appointment.time === time
    );
    if (alreadyBooked) {
        return res.status(409).send("That time slot is already booked. Please choose another time.");
    }

    appointments.push({ name, phone, service, date, time });
    return res.redirect(303, "/");
});

module.exports = { app, appointments };

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Cut & Co. is running on port ${PORT}`);
    });
}
