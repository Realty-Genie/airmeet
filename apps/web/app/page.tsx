import { logFormData } from "./actions";

export default function Home() {
  return (
    <main className="glass-container">
      <h1 className="form-title">Book a call</h1>
      <p className="form-subtitle">Enter your details to get started</p>

      <form action={logFormData} className="flex flex-col gap-6">
        <div className="input-group">
          <label htmlFor="name" className="input-label">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            className="input-field"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email" className="input-label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@example.com"
            className="input-field"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="phone" className="input-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+1 (555) 000-0000"
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="submit-btn box-border">
          Call now
        </button>
      </form>
    </main>
  );
}
