import React, { useEffect, useState } from "react";
import arisePoster from "../images/WhatsApp Image 2026-10-20 at 2.22.33 pm.jpeg";
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  ChevronRight,
  Church,
  CircleAlert,
  Link,
  LoaderCircle,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const adminUids = (import.meta.env.VITE_FIREBASE_ADMIN_UIDS || "")
  .split(",")
  .map((uid) => uid.trim())
  .filter(Boolean);
const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);
const firebaseApp = firebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  department: "",
  institution: "",
  address: "",
};

function Field({ label, name, value, onChange, required, type = "text", placeholder, wide }) {
  return (
    <label className={`field${wide ? " field-wide" : ""}`} htmlFor={name}>
      <span>{label}{required && <span className="required"> *</span>}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={name === "address" ? 240 : 120}
        autoComplete={name === "fullName" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : "off"}
      />
    </label>
  );
}

function BrandPanel({ admin = false }) {
  return (
    <aside className={`brand-panel event-brand${admin ? " admin-event-brand" : ""}`}>
      <img
        className="event-poster"
        src={arisePoster}
        alt="ARISE 2026 Youth and Young Adults Conference at Faith Baptist Church. Theme: Prudence. Saturday, November 14 at 10:30 AM and Sunday, November 15 at 9:00 AM."
      />
    </aside>
  );
}

function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function copyRegistrationLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Copy this page address to share");
    }
  }

  async function submitRegistration(event) {
    event.preventDefault();
    if (!db) {
      setResult({ type: "error", text: "Registration is not connected yet. Please contact the fellowship team." });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      await addDoc(collection(db, "student_registrations"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        institution: form.institution.trim(),
        address: form.address.trim(),
        attended: false,
        createdAt: serverTimestamp(),
      });
      setForm(initialForm);
      setResult({ type: "success", text: "You're registered for ARISE 2026. We look forward to seeing you." });
    } catch {
      setResult({ type: "error", text: "We couldn't submit your registration. Please try again in a moment." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <BrandPanel />
      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-content">
          <div className="form-topline">
            <div className="form-kicker"><span className="kicker-line" /> ARISE 2026 REGISTRATION</div>
            <div className="share-control">
              <button className="share-button" type="button" onClick={copyRegistrationLink}>
                {shareStatus === "Link copied" ? <Check size={15} /> : <Link size={15} />}
                {shareStatus === "Link copied" ? "Copied" : "Copy link"}
              </button>
              {shareStatus && <span className="share-feedback" role="status">{shareStatus}</span>}
            </div>
          </div>
          <h2 id="form-title">Be part of ARISE.</h2>
          <p className="form-intro">Register for two days of worship, fellowship, and growth at Faith Baptist Church.</p>

          {!firebaseConfigured && (
            <div className="setup-note" role="status">
              <CircleAlert size={18} />
              <span>Firebase is not configured. Add your project settings to <code>.env</code> to accept registrations.</span>
            </div>
          )}

          <form onSubmit={submitRegistration}>
            <div className="form-grid">
              <Field label="Full name" name="fullName" value={form.fullName} onChange={updateField} required placeholder="Your name" wide />
              <Field label="Email address" name="email" value={form.email} onChange={updateField} required type="email" placeholder="you@example.com" />
              <Field label="Phone number" name="phone" value={form.phone} onChange={updateField} required type="tel" placeholder="Your number" />
              <Field label="Church / ministry" name="department" value={form.department} onChange={updateField} required placeholder="Church, ministry, or guest" wide />
              <Field label="School / institution" name="institution" value={form.institution} onChange={updateField} placeholder="School or institution" wide />
              <label className="field field-wide" htmlFor="address">
                <span>Residential / hostel address <span className="optional">OPTIONAL</span></span>
                <textarea id="address" name="address" value={form.address} onChange={updateField} rows="2" maxLength="240" placeholder="Your local address" />
              </label>
            </div>
            <button className="submit-button" type="submit" disabled={busy || !firebaseConfigured}>
              {busy ? <><LoaderCircle className="spin" size={18} /> Sending registration</> : <>Register for ARISE 2026 <ChevronRight size={18} /></>}
            </button>
          </form>

          {result && (
            <div className={`form-result ${result.type}`} role="status">
              {result.type === "success" ? <Check size={18} /> : <CircleAlert size={18} />}
              <span>{result.text}</span>
            </div>
          )}

          <div className="privacy-note"><ShieldCheck size={16} /><span>Your details are only shared with conference administrators.</span></div>
          <a className="admin-link" href="#admin">Administrator access <ArrowDownToLine size={14} /></a>
        </div>
        <div className="mobile-footer"><Church size={15} /> FAITH BAPTIST CHURCH · ARISE 2026</div>
      </section>
    </main>
  );
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp.toDate());
}

function AdminPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingIds, setUpdatingIds] = useState(() => new Set());

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return undefined;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  const isAdmin = Boolean(user && adminUids.includes(user.uid));

  useEffect(() => {
    if (!isAdmin || !db) return;
    let active = true;
    setLoading(true);
    getDocs(query(collection(db, "student_registrations"), orderBy("createdAt", "desc")))
      .then((snapshot) => {
        if (active) setRecords(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      })
      .catch(() => {
        if (active) setMessage("Couldn't load registrations. Check the Firestore rules and admin UID configuration.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isAdmin]);

  async function handleSignIn() {
    setMessage("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setMessage("Sign-in was not completed. Please try again or allow pop-ups for this site.");
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setRecords([]);
    setMessage("");
  }

  async function updateAttendance(recordId, attended) {
    setUpdatingIds((current) => new Set(current).add(recordId));
    setMessage("");
    try {
      await updateDoc(doc(db, "student_registrations", recordId), { attended });
      setRecords((current) => current.map((record) =>
        record.id === recordId ? { ...record, attended } : record,
      ));
    } catch {
      setMessage("Couldn't update attendance. Please try again.");
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(recordId);
        return next;
      });
    }
  }

  async function exportWorkbook() {
    const XLSX = await import("@e965/xlsx");
    const rows = records.map(({ fullName, email, phone, department, institution, address, createdAt, attended }) => ({
        "Full Name": fullName || "",
        Email: email || "",
        Phone: phone || "",
        Department: department || "",
        Institution: institution || "",
        Address: address || "",
      Attended: attended === true ? "Yes" : "No",
        Registered: formatDate(createdAt),
    }));
      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Registrations");
      XLSX.writeFile(workbook, "student-registrations.xlsx");
  }

  const filteredRecords = records.filter((record) =>
    [record.fullName, record.email, record.phone, record.department, record.institution]
      .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())),
  );
  const attendedCount = records.filter((record) => record.attended === true).length;

  return (
    <main className="app-shell admin-shell">
      <BrandPanel admin />
      <section className="admin-panel">
        <a className="back-link" href="#register"><ArrowLeft size={16} /> Back to registration</a>
        {!authReady ? (
          <div className="admin-state"><LoaderCircle className="spin" size={24} /><span>Checking sign-in…</span></div>
        ) : !user ? (
          <div className="admin-gate">
            <span className="gate-icon"><ShieldCheck size={23} /></span>
            <p className="form-kicker"><span className="kicker-line" /> RESTRICTED AREA</p>
            <h2>Administrator sign in</h2>
            <p className="form-intro">Sign in with the Google account authorized to manage registrations.</p>
            {!firebaseConfigured && <div className="setup-note"><CircleAlert size={18} /><span>Connect Firebase before signing in.</span></div>}
            {message && <div className="inline-error" role="alert">{message}</div>}
            <button className="submit-button sign-in-button" onClick={handleSignIn} disabled={!firebaseConfigured}>
              <LogIn size={18} /> Continue with Google
            </button>
            <p className="security-caption"><ShieldCheck size={15} /> Registration records are protected by Firestore security rules.</p>
          </div>
        ) : !isAdmin ? (
          <div className="admin-gate">
            <span className="gate-icon warning"><CircleAlert size={23} /></span>
            <p className="form-kicker"><span className="kicker-line" /> ACCESS NOT GRANTED</p>
            <h2>This account isn’t an admin yet.</h2>
            <p className="form-intro">Ask the project owner to add this UID to the admin allowlist in the app settings and Firestore rules.</p>
            <div className="uid-box"><span>Your account UID</span><code>{user.uid}</code></div>
            <button className="secondary-button" onClick={handleSignOut}><LogOut size={16} /> Sign out</button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="dashboard-heading">
              <div>
                <p className="form-kicker"><span className="kicker-line" /> ARISE 2026 ATTENDANCE</p>
                <h2>Registrations</h2>
                <p className="form-intro">Signed in as {user.email}</p>
              </div>
              <button className="icon-button" onClick={handleSignOut} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button>
            </div>
            <div className="dashboard-tools">
              <div className="record-count"><UsersRound size={18} /><strong>{records.length}</strong><span>{records.length === 1 ? "attendee" : "attendees"}</span></div>
              <div className="attendance-count"><Check size={16} /><strong>{attendedCount}</strong><span>attended</span></div>
              <button className="export-button" onClick={exportWorkbook} disabled={!records.length}><ArrowDownToLine size={17} /> Export Excel</button>
            </div>
            <label className="search-box" htmlFor="registration-search">
              <Search size={17} />
              <input id="registration-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, department…" />
            </label>
            {message && <div className="inline-error" role="alert">{message}</div>}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Attendee</th><th>Contact</th><th>Church / ministry</th><th>Institution</th><th>Attendance</th><th>Registered</th></tr></thead>
                <tbody>
                  {loading ? <tr><td className="table-empty" colSpan="6"><LoaderCircle className="spin" size={19} /> Loading registrations…</td></tr>
                    : filteredRecords.length ? filteredRecords.map((record) => (
                      <tr key={record.id}>
                        <td><strong>{record.fullName}</strong></td>
                        <td>{record.email}<small>{record.phone}</small></td>
                        <td>{record.department}</td>
                        <td>{record.institution || "—"}</td>
                        <td>
                          <label className={`attendance-toggle${record.attended === true ? " is-attended" : ""}`}>
                            <input
                              type="checkbox"
                              checked={record.attended === true}
                              disabled={updatingIds.has(record.id)}
                              onChange={(event) => updateAttendance(record.id, event.target.checked)}
                              aria-label={`Mark ${record.fullName} as attended`}
                            />
                            <span>{record.attended === true ? "Attended" : "Mark present"}</span>
                          </label>
                        </td>
                        <td>{formatDate(record.createdAt)}</td>
                      </tr>
                    )) : <tr><td className="table-empty" colSpan="6">{records.length ? "No matching registrations." : "No registrations yet."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === "#admin");

  useEffect(() => {
    function syncRoute() {
      setIsAdminRoute(window.location.hash === "#admin");
    }
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  return isAdminRoute ? <AdminPage /> : <RegistrationPage />;
}