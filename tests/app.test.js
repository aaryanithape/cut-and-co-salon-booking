const request = require("supertest");
const { app, appointments } = require("../server");

const validAppointment = {
    name: "Jamie Taylor",
    phone: "+91 98765 43210",
    service: "Haircut",
    date: "2030-06-15",
    time: "10:00 AM"
};

beforeEach(() => {
    appointments.length = 0;
});

describe("Cut & Co. booking app", () => {
    it("returns the healthy status", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });

    it("accepts a valid booking and renders it on the home page", async () => {
        const booking = await request(app).post("/appointments").type("form").send(validAppointment);
        const page = await request(app).get("/");

        expect(booking.status).toBe(303);
        expect(page.status).toBe(200);
        expect(page.text).toContain("Jamie Taylor");
        expect(page.text).toContain("Haircut");
    });

    it("returns appointments from the JSON API", async () => {
        await request(app).post("/appointments").type("form").send(validAppointment);

        const response = await request(app).get("/api/appointments");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([validAppointment]);
    });

    it("exposes the running commit ID for deployment verification", async () => {
        const previousCommit = process.env.RENDER_GIT_COMMIT;
        process.env.RENDER_GIT_COMMIT = "abc123";

        const response = await request(app).get("/api/version");

        if (previousCommit === undefined) {
            delete process.env.RENDER_GIT_COMMIT;
        } else {
            process.env.RENDER_GIT_COMMIT = previousCommit;
        }
        expect(response.body).toEqual({ commit: "abc123" });
    });

    it("rejects missing or invalid appointment details", async () => {
        const response = await request(app).post("/appointments").type("form").send({
            ...validAppointment,
            phone: "no phone",
            service: "Unknown service"
        });

        expect(response.status).toBe(400);
        expect(appointments).toHaveLength(0);
    });

    it("prevents two bookings for the same date and time", async () => {
        await request(app).post("/appointments").type("form").send(validAppointment);
        const duplicate = await request(app).post("/appointments").type("form").send({
            ...validAppointment,
            name: "Another Customer"
        });

        expect(duplicate.status).toBe(409);
        expect(appointments).toHaveLength(1);
    });

    it("escapes customer input in the server-rendered page", async () => {
        await request(app).post("/appointments").type("form").send({
            ...validAppointment,
            name: "<img src=x onerror=alert(1)>"
        });
        const page = await request(app).get("/");

        expect(page.text).toContain("&lt;img src=x onerror=alert(1)&gt;");
        expect(page.text).not.toContain("<img src=x onerror=alert(1)>");
    });
});
