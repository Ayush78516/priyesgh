import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import PayButton from "../components/PayButton";

const STATES = [
  "Select State",
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STATE_CODE_MAP = {
  "Andhra Pradesh": "37", "Arunachal Pradesh": "12", "Assam": "18", "Bihar": "10", "Chhattisgarh": "22",
  "Goa": "30", "Gujarat": "24", "Haryana": "06", "Himachal Pradesh": "02", "Jharkhand": "20",
  "Karnataka": "29", "Kerala": "32", "Madhya Pradesh": "23", "Maharashtra": "27", "Manipur": "14",
  "Meghalaya": "17", "Mizoram": "15", "Nagaland": "13", "Odisha": "21", "Punjab": "03",
  "Rajasthan": "08", "Sikkim": "11", "Tamil Nadu": "33", "Telangana": "36", "Tripura": "16",
  "Uttar Pradesh": "09", "Uttarakhand": "05", "West Bengal": "19", 
  "Andaman & Nicobar Islands": "35", "Chandigarh": "04", "Dadra & Nagar Haveli and Daman & Diu": "26",
  "Delhi": "07", "Jammu & Kashmir": "01", "Ladakh": "38", "Lakshadweep": "31", "Puducherry": "34"
};

const MEMBER_ASSET_MAP = {
  "Student": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
  "Affiliate": ["Affiliate (Land & Building Valuation)", "Affiliate (Plant & Machinery Valuation)", "Affiliate (Business Valuation)", "Affiliate (Jewellery & Precious Assets)", "Affiliate (Financial Instruments & Securities)"],
  "Chartered": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
  "Fellow": ["Plant, Equipment & Infrastructure", "Land and Building", "Business Valuation", "Financial Instruments"],
  "Institutional": ["Corporate Membership", "Institutional Membership"],
  "Non-Member": [],
};

const MEMBER_TYPES = ["Monthly", "Quarterly", "Annual"];

// Calculate validity based on member type
function calcValidity(type) {
  if (!type) return "";
  const now = new Date();
  let endYear = now.getFullYear();
  if (type === "Monthly") {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  }
  if (type === "Quarterly") {
    const month = now.getMonth();
    if (month < 3) return `31 March ${now.getFullYear()}`;
    if (month < 6) return `30 June ${now.getFullYear()}`;
    if (month < 9) return `30 September ${now.getFullYear()}`;
    return `31 December ${now.getFullYear()}`;
  }
  if (type === "Annual") {
    // Financial year end: 31 March
    endYear = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
    return `31 March ${endYear}`;
  }
  return "";
}

const termsQuestions = [
  { name: "q1", text: "Have you ever been Convicted for an offence?", defaultYes: false },
  { name: "q2", text: "Whether any criminal proceeding is initiated against you and is pending for disposal before the court of law? (excluding litigation of personal/matrimonial nature)", defaultYes: false },
  { name: "q3", text: "Have you ever been declared as an undischarged bankrupt or applied to be adjudged as Bankrupt?", defaultYes: false },
  { name: "q4", text: "Have you ever been restrained by any public sector bank / any other institution to conduct valuation services and subsequently de-panelled from their panel?", defaultYes: false },
  { name: "q5", text: "Whether any disciplinary proceeding are pending or any disciplinary action has been taken at any time in the preceding three years against you by the institution / body of which you are a member?", defaultYes: false },
  { name: "q6", text: "Whether you had an unblemished service with the last employer in case of employment?", defaultYes: true },
  { name: "q7", text: "Whether your name appears in the database of MCA regarding:", defaultYes: false, hasSubList: true },
  { name: "q9", text: "Whether you have been penalised by a market regulator (SEBI or CCI) in the last 3 years?", defaultYes: false },
  { name: "q10", text: "Whether your name appears in the list of defaulters of RBI?", defaultYes: false },
];
const subQuestions = [
  { name: "q8a", text: "Directors disqualified under section 164 of companies act 2013" },
  { name: "q8b", text: "Proclaimed Offenders under section 82 of the code of Criminal Procedure, 1973?" },
];
const initAnswers = {};
termsQuestions.forEach(q => { initAnswers[q.name] = q.defaultYes ? "yes" : "no"; });
subQuestions.forEach(q => { initAnswers[q.name] = "no"; });

const NAV_TABS = ["personal", "address", "education", "work", "membership"];

const sidebarItems = [
  { key: "personal", icon: "👤", label: "Personal Details" },
  { key: "address", icon: "📍", label: "Address Details" },
  { key: "education", icon: "🎓", label: "Qualification Details" },
  { key: "work", icon: "💼", label: "Experience Details" },
  { key: "membership", icon: "🪪", label: "Member Details" },
  { key: "payment", icon: "💳", label: "Payment History" },
  { key: "events", icon: "🎟️", label: "Event Registrations" },
  { key: "scrutiny", icon: "🔍", label: "Scrutiny Status" },
];

const SIDEBAR_COLLAPSE_KEY = "cov_user_dashboard_sidebar_collapsed";

const ICONS = {
  user: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  signature: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
  card: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  passport: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  doc: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  car: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"></rect><circle cx="7" cy="15" r="2"></circle><circle cx="15" cy="15" r="2"></circle><path d="M10 9l-2 0l-3 3l0 3"></path></svg>
};

const getDrivePreview = (url) => {
  if (!url || !url.toString().includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)\//);
  if (match && match[1]) return `https://drive.google.com/uc?id=${match[1]}`;
  const idMatch = url.match(/[?&]id=(.+?)(&|$)/);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?id=${idMatch[1]}`;
  return url;
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("personal");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1";
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      // Ignore persistence failures.
    }
  }, [sidebarCollapsed]);

  const [showPreview, setShowPreview] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { loading: saving, setLoading: setSaving, showToast: showSaveMsg } = useUI();
  const [previewFile, setPreviewFile] = useState(null); // { url: string, type: 'image' | 'pdf', label: string }
  const [isLocked, setIsLocked] = useState(false);
  const [scrutinyStatus, setScrutinyStatus] = useState("Pending");
  const [dashSchema, setDashSchema] = useState({
    personal_extra: [],
    uploads_extra: [],
    address_extra: [],
    edu_cols: null,
    pro_cols: null,
    exp_cols: null,
    member_extra: [],
    custom_sections: [],
    page_visibility: {}, // empty = all pages active
  });
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [gstDetails, setGstDetails] = useState({
    gstNumber: "",
    companyName: "",
    state: "Select State",
    stateCode: "",
    billingAddress: ""
  });

  const [topInfo, setTopInfo] = useState({
    memberClass: "", assetClass: "", membershipNo: "", status: "Pending",
  });

  const [hasPaid, setHasPaid] = useState(false);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]); // Array to hold registered events

  const [personal, setPersonal] = useState({
    title: "Mr.", gender: "Male",
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    fatherName: "", dob: "", email: user?.email || "", mobile: user?.phone || "",
  });

  // Upload refs + file name display
  const pictureRef = useRef(null);
  const signatureRef = useRef(null);
  const panRef = useRef(null);
  const aadharRef = useRef(null);
  const dlPassportVoterRef = useRef(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [panFileName, setPanFileName] = useState("");
  const [aadharFileName, setAadharFileName] = useState("");
  // uploadedDocs stores file names/URLs so they persist across logins
  const [uploadedDocs, setUploadedDocs] = useState({});

  // Save uploaded doc names/URLs to backend so they persist after re-login
  const saveUploadedDocs = async (newDocs) => {
    try {
      await fetch("/api/user/uploaded-docs", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uploadedDocs: newDocs }),
      });
    } catch (err) { console.error("saveUploadedDocs:", err.message); }
  };

  // Helper: update a single doc field and persist
  const handleDocUpload = async (key, file, setPreview) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", key);

    try {
      setSaving(true);
      const res = await fetch("/api/user/upload-doc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const newDocs = { ...uploadedDocs, [key]: data.url };
      setUploadedDocs(newDocs);
      if (setPreview) setPreview(URL.createObjectURL(file));
      showSaveMsg(`✅ ${key} uploaded successfully!`);
    } catch (err) {
      console.error("handleDocUpload error:", err);
      showSaveMsg("❌ Upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadTableFile = async (table, index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", `${table}_${index}`);

    try {
      setSaving(true);
      const res = await fetch("/api/user/upload-doc", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (table === "edu") {
        const r = [...eduRows];
        r[index].fileName = data.url;
        setEduRows(r);
      } else if (table === "pro") {
        const r = [...proRows];
        r[index].fileName = data.url;
        setProRows(r);
      } else if (table === "exp") {
        const r = [...expRows];
        r[index].fileName = data.url;
        setExpRows(r);
      }
      showSaveMsg(`✅ File uploaded successfully!`);
    } catch (err) {
      showSaveMsg("❌ Upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [permAddress, setPermAddress] = useState({ line1: "", line2: "", city: "", state: "Select State", district: "", pincode: "" });
  const [corrAddress, setCorrAddress] = useState({ line1: "", line2: "", city: "", state: "Select State", district: "", pincode: "" });
  const [sameAsMain, setSameAsMain] = useState(false);

  const handlePermChange = (field, value) => {
    const updated = { ...permAddress, [field]: value };
    setPermAddress(updated);
    if (sameAsMain) setCorrAddress({ ...updated });
  };
  const handleSameAsMain = (checked) => {
    setSameAsMain(checked);
    if (checked) setCorrAddress({ ...permAddress });
  };

  // Education rows + file names
  const [eduRows, setEduRows] = useState([
    { qualification: "", year: "", marks: "", board: "", college: "", fileName: "" },
    { qualification: "", year: "", marks: "", board: "", college: "", fileName: "" },
  ]);
  const eduFileRefs = useRef([]);

  // Professional rows + file names
  const [proRows, setProRows] = useState([
    { qualification: "", institute: "", membershipNo: "", year: "", validity: "", fileName: "" },
  ]);
  const proFileRefs = useRef([]);

  // Experience rows + file names
  const [expRows, setExpRows] = useState([
    { status: "", years: "", from: "", to: "", employer: "", designation: "", area: "", fileName: "" },
    { status: "", years: "", from: "", to: "", employer: "", designation: "", area: "", fileName: "" },
  ]);
  const expFileRefs = useRef([]);

  const [answers, setAnswers] = useState(initAnswers);

  const [memberDetails, setMemberDetails] = useState({
    memberClass: "", assetClass: "", validTill: "",
    membershipNo: "", status: "Pending",
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  // ── HANDLE MEMBER TYPE CHANGE ──
  const handleMemberTypeChange = (type) => {
    const validTill = calcValidity(type);
    setMemberDetails(prev => ({ ...prev, validTill }));
  };

  // ── VALIDATION ──
  const validateSection = (tab) => {
    if (tab === "personal") {
      const builtinOk = personal.firstName && personal.lastName && personal.email && personal.mobile && personal.dob && personal.gender;
      // Requirement: Profile picture, signature, Pan & Adhar mandatory (they have *)
      const mandatoryDocsOk = uploadedDocs.picture && uploadedDocs.signature && uploadedDocs.pan && uploadedDocs.aadhar;
      // Only admin-added personal fields with "*" are compulsory
      const extraOk = dashSchema.personal_extra.every(f => {
        if (!f.label.includes("*")) return true;
        return customFieldValues[f.id] && customFieldValues[f.id].toString().trim() !== "";
      });
      // Only admin-added upload boxes with "*" are compulsory
      const uploadsOk = dashSchema.uploads_extra.every(u => {
        if (!u.label.includes("*")) return true;
        return customFieldValues[`upload_${u.id}`] && customFieldValues[`upload_${u.id}`] !== "";
      });
      return builtinOk && mandatoryDocsOk && extraOk && uploadsOk;
    }
    if (tab === "address") return permAddress.line1 && permAddress.city && permAddress.state !== "Select State" && permAddress.pincode;
    if (tab === "education") return eduRows.some(r => r.qualification && r.year);
    if (tab === "work") return expRows.some(r => r.employer && r.designation);
    if (tab === "membership") {
      const builtinOk = memberDetails.memberClass && (memberDetails.memberClass === "Non-Member" || memberDetails.assetClass);
      // Only admin-added member detail fields with "*" are compulsory
      const extraOk = dashSchema.member_extra.every(f => {
        if (!f.label.includes("*")) return true;
        return customFieldValues[f.id] && customFieldValues[f.id].toString().trim() !== "";
      });
      return builtinOk && extraOk;
    }
    return true;
  };
  const allSectionsValid = NAV_TABS.every(tab => validateSection(tab));

  const getMissingFieldsForTab = (tab) => {
    const m = [];
    if (tab === "personal") {
      if (!personal.firstName) m.push("First Name");
      if (!personal.lastName) m.push("Last Name");
      if (!personal.email) m.push("Email");
      if (!personal.mobile) m.push("Mobile");
      if (!personal.dob) m.push("DOB");
      if (!personal.gender) m.push("Gender");
      if (!uploadedDocs.picture) m.push("Profile Picture");
      if (!uploadedDocs.signature) m.push("Signature");
      if (!uploadedDocs.pan) m.push("PAN Card");
      if (!uploadedDocs.aadhar) m.push("Aadhar Card");
      dashSchema.personal_extra.forEach(f => { if (f.label.includes("*") && !customFieldValues[f.id]) m.push(f.label); });
      dashSchema.uploads_extra.forEach(u => { if (u.label.includes("*") && !customFieldValues[`upload_${u.id}`]) m.push(u.label); });
    }
    if (tab === "address") {
      if (!permAddress.line1) m.push("Address Line 1");
      if (!permAddress.city) m.push("City");
      if (permAddress.state === "Select State") m.push("State");
      if (!permAddress.pincode) m.push("Pincode");
    }
    if (tab === "education") {
      if (!eduRows.some(r => r.qualification && r.year)) m.push("At least one qualification");
    }
    if (tab === "work") {
      if (!expRows.some(r => r.employer && r.designation)) m.push("At least one work experience");
    }
    if (tab === "membership") {
      if (!memberDetails.memberClass) m.push("Member Class");
      if (memberDetails.memberClass !== "Non-Member" && !memberDetails.assetClass) m.push("Asset Class");
      dashSchema.member_extra.forEach(f => { if (f.label.includes("*") && !customFieldValues[f.id]) m.push(f.label); });
    }
    return m;
  };

  const getMissingFields = () => {
    let all = [];
    NAV_TABS.forEach(tab => {
      all = [...all, ...getMissingFieldsForTab(tab)];
    });
    return all;
  };

  // ── FETCH PROFILE ──
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch Schema
        const schemaRes = await fetch("/api/public/cms");
        const schemaData = await schemaRes.json();
        if (schemaData.success) {
          const cmsMap = {};
          schemaData.data.forEach(item => {
            if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
          });
          const parse = (key, fallback = []) => {
            try { return JSON.parse(cmsMap[key] || "null") || fallback; }
            catch { return fallback; }
          };
          setDashSchema({
            personal_extra: parse("dash_schema_personal"),
            uploads_extra: parse("dash_schema_uploads"),
            address_extra: parse("dash_schema_address"),
            edu_cols: parse("dash_schema_edu_cols"),
            pro_cols: parse("dash_schema_pro_cols"),
            exp_cols: parse("dash_schema_exp_cols"),
            member_extra: parse("dash_schema_member_details").filter(f => !f.builtin),
            custom_sections: parse("dash_schema_custom_sections"),
            page_visibility: (() => {
              try { return JSON.parse(cmsMap["dash_page_visibility"] || "{}"); } catch { return {}; }
            })(),
          });
        }

        // 2. Fetch Profile
        if (token) {
          const profileRes = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
          const profileData = await profileRes.json();
          if (profileData.success) {
            const u = profileData.data;
            if (u.uploadedDocs && Object.keys(u.uploadedDocs).length > 0) {
              setUploadedDocs(u.uploadedDocs);
              if (u.uploadedDocs.picture) setPicturePreview(getDrivePreview(u.uploadedDocs.picture));
              if (u.uploadedDocs.signature) setSignaturePreview(getDrivePreview(u.uploadedDocs.signature));
              if (u.uploadedDocs.pan) setPanFileName(u.uploadedDocs.pan);
              if (u.uploadedDocs.aadhar) setAadharFileName(u.uploadedDocs.aadhar);
            }
            setIsLocked(u.isLocked || false);
            setScrutinyStatus(u.scrutinyStatus || "Pending");
            if (u.personal) {
              setPersonal(prev => ({
                ...prev,
                title: u.personal.title || prev.title,
                gender: u.personal.gender || prev.gender,
                firstName: u.firstName || prev.firstName,
                lastName: u.lastName || prev.lastName,
                fatherName: u.personal.fatherName || "",
                dob: u.personal.dob || "",
                email: u.email || prev.email,
                mobile: u.personal.mobile || u.phone || "",
              }));
            }
            if (u.gstDetails) {
              setGstDetails({
                gstNumber: u.gstDetails.gstNumber || "",
                companyName: u.gstDetails.companyName || "",
                state: u.gstDetails.state || "Select State",
                stateCode: u.gstDetails.stateCode || "",
                billingAddress: u.gstDetails.billingAddress || ""
              });
            }
            if (u.permAddress) setPermAddress(u.permAddress);
            if (u.corrAddress) setCorrAddress(u.corrAddress);
            if (u.education && u.education.length > 0) setEduRows(u.education);
            if (u.professionalQualification && u.professionalQualification.length > 0) setProRows(u.professionalQualification);
            if (u.experience && u.experience.length > 0) setExpRows(u.experience);
            if (u.memberDetails) {
              setMemberDetails(prev => ({ ...prev, ...u.memberDetails, membershipNo: u.tempMembershipId || prev.membershipNo }));
              setTopInfo({
                memberClass: u.memberDetails.memberClass || "",
                assetClass: u.memberDetails.assetClass || "",
                membershipNo: u.tempMembershipId || "",
                status: u.scrutinyStatus || u.memberDetails.status || "Pending",
              });
            } else {
              const pendingClass = localStorage.getItem("pendingMemberClass") || "";
              if (pendingClass) {
                setMemberDetails(prev => ({
                  ...prev,
                  memberClass: pendingClass,
                  assetClass: pendingClass === "Non-Member" ? "" : prev.assetClass,
                  membershipNo: u.tempMembershipId || prev.membershipNo,
                }));
                setTopInfo(prev => ({
                  ...prev,
                  memberClass: pendingClass,
                  membershipNo: u.tempMembershipId || prev.membershipNo,
                  status: u.scrutinyStatus || "Pending",
                }));
              } else if (u.tempMembershipId) {
                setMemberDetails(prev => ({ ...prev, membershipNo: u.tempMembershipId }));
                setTopInfo(prev => ({ ...prev, membershipNo: u.tempMembershipId, status: u.scrutinyStatus || "Pending" }));
              }
            }
            if (u.payments && Array.isArray(u.payments)) {
              setPayments(u.payments);
              if (u.payments.some(p => p && (p.status === "Success" || p.status === "Completed"))) setHasPaid(true);
            }
            try {
              const invoiceRes = await fetch("/api/gst/invoices", { headers: { Authorization: `Bearer ${token}` } });
              const invoiceData = await invoiceRes.json();
              if (invoiceData.success) {
                setInvoices(invoiceData.data || []);
              }
            } catch (invErr) {
              console.error("Failed to load user invoices:", invErr.message);
            }
          }
        }
        
        // Mock fetching event registrations for member
        const searchParams = new URLSearchParams(window.location.search);
        const payForEventId = searchParams.get("payForEvent");
        setTimeout(() => {
          if (payForEventId) {
            setEventRegistrations([
              {
                id: payForEventId,
                title: "Valuation Masterclass 2024",
                date: "15th August 2024",
                fee: "₹2500", // Discounted member fee
                status: "Pending",
              }
            ]);
            setActiveTab("events");
          }
        }, 1000);

        setDataLoaded(true);
      } catch (err) {
        console.error("Initialization error:", err.message);
        setDataLoaded(true); // Ensure it's marked as loaded even on error to allow interaction
      }
    };
    initData();
  }, [token]);

  const findFirstIncompleteTab = () => {
    for (const tab of NAV_TABS) {
      if (getMissingFieldsForTab(tab).length > 0) return tab;
    }
    return null;
  };

  // Requirement: Smart Redirection on Login
  // If all complete -> Show Preview. If not -> First incomplete tab.
  const isGuest = topInfo.memberClass === "Non-Member" || memberDetails.memberClass === "Non-Member";

  useEffect(() => {
    if (dataLoaded && isGuest) {
      if (activeTab !== "events" && activeTab !== "payment" && activeTab !== "password") {
        setActiveTab("events");
      }
      setShowPreview(false);
    } else if (dataLoaded && !hasPaid) {
      const incomplete = findFirstIncompleteTab();
      if (!incomplete) {
        setShowPreview(true);
      } else {
        setActiveTab(incomplete);
        setShowPreview(false);
      }
    }
  }, [dataLoaded, hasPaid, isGuest, activeTab]);

  // ── FETCH DASHBOARD SCHEMA FROM CMS ──
  // ── SAVE HANDLERS ──

  const savePersonal = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/personal", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: personal.firstName, lastName: personal.lastName, email: personal.email, personal: { title: personal.title, gender: personal.gender, fatherName: personal.fatherName, dob: personal.dob, mobile: personal.mobile } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Personal details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveAddress = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permAddress, corrAddress, gstDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Address & GST details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  // FIX 3: saveEducation and saveExperience now actually call the API
  const saveEducation = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/education", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ education: eduRows, professionalQualification: proRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Qualification details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveExperience = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ experience: expRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showSaveMsg("✅ Experience details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const saveMemberDetails = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/member-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTopInfo({ memberClass: memberDetails.memberClass, assetClass: memberDetails.assetClass, membershipNo: memberDetails.membershipNo, status: memberDetails.status });
      showSaveMsg("✓ Member details saved!");
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showSaveMsg("❌ All password fields are required.");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showSaveMsg("❌ New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      showSaveMsg("✓ Password updated successfully!");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) { showSaveMsg("❌ " + err.message); } finally { setSaving(false); }
  };

  const goNext = async () => {
    if (!validateSection(activeTab)) {
      const missing = getMissingFieldsForTab(activeTab);
      showSaveMsg("⚠️ Missing: " + missing.join(", "));
      return;
    }

    // Auto-save based on current tab
    try {
      if (activeTab === "personal") await savePersonal();
      else if (activeTab === "address") await saveAddress();
      else if (activeTab === "education") await saveEducation();
      else if (activeTab === "work") await saveExperience();
      else if (activeTab === "membership") await saveMemberDetails();
      
      const idx = NAV_TABS.indexOf(activeTab);
      if (idx < NAV_TABS.length - 1) setActiveTab(NAV_TABS[idx + 1]);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const goBack = () => {
    const idx = NAV_TABS.indexOf(activeTab);
    if (idx > 0) setActiveTab(NAV_TABS[idx - 1]);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email;
    return "Member";
  };

  const assetOptions = MEMBER_ASSET_MAP[memberDetails.memberClass] || [];

  const RadioGroup = ({ name }) => (
    <div style={{ display: "flex", gap: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
        <input type="radio" name={name} value="yes" checked={answers[name] === "yes"} onChange={() => setAnswers({ ...answers, [name]: "yes" })} /> Yes
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
        <input type="radio" name={name} value="no" checked={answers[name] === "no"} onChange={() => setAnswers({ ...answers, [name]: "no" })} /> No
      </label>
    </div>
  );

  // ── PREVIEW PAGE ──
  if (showPreview) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.topBar}>
          <div style={styles.brand}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={styles.userPill}>
              <div style={styles.avatar}>{getInitials()}</div>
              <span style={styles.userName}>{getDisplayName()}</span>
            </div>
            <button onClick={() => logout()} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Logout</button>
          </div>
        </div>
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,43,91,0.12)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#002b5b" }}>Member Preview</h2>
          <button onClick={() => setShowPreview(false)} style={{ background: "none", border: "1px solid #002b5b", color: "#002b5b", padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Back</button>
        </div>
        <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Personal Details</h3>
              <PreviewTable rows={[["Title", personal.title], ["First Name", personal.firstName], ["Last Name", personal.lastName], ["Gender", personal.gender], ["Date of Birth", personal.dob], ["Father / Husband Name", personal.fatherName], ["Email", personal.email], ["Mobile", personal.mobile]]} />
            </div>
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>Address Details</h3>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#00a6a6", marginBottom: 8, textTransform: "uppercase" }}>Permanent Address</p>
              <PreviewTable rows={[["Address", `${permAddress.line1}${permAddress.line2 ? ", " + permAddress.line2 : ""}`], ["City", permAddress.city], ["State", permAddress.state], ["District", permAddress.district], ["Pincode", permAddress.pincode]]} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#00a6a6", margin: "16px 0 8px", textTransform: "uppercase" }}>Correspondence Address</p>
              <PreviewTable rows={[["Address", `${corrAddress.line1}${corrAddress.line2 ? ", " + corrAddress.line2 : ""}`], ["City", corrAddress.city], ["State", corrAddress.state], ["Pincode", corrAddress.pincode]]} />
            </div>
          </div>

          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Uploaded Documents</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {uploadedDocs.picture && (
                <button onClick={() => setPreviewFile({ url: uploadedDocs.picture, label: "Profile Picture" })} style={{ ...styles.uploadBtn, background: "#059669" }}>👁️ Profile Picture</button>
              )}
              {uploadedDocs.signature && (
                <button onClick={() => setPreviewFile({ url: uploadedDocs.signature, label: "Signature" })} style={{ ...styles.uploadBtn, background: "#059669" }}>👁️ Signature</button>
              )}
              {uploadedDocs.pan && (
                <button onClick={() => setPreviewFile({ url: uploadedDocs.pan, label: "PAN Card" })} style={{ ...styles.uploadBtn, background: "#059669" }}>👁️ PAN Card</button>
              )}
              {uploadedDocs.aadhar && (
                <button onClick={() => setPreviewFile({ url: uploadedDocs.aadhar, label: "Aadhar Card" })} style={{ ...styles.uploadBtn, background: "#059669" }}>👁️ Aadhar Card</button>
              )}
              {uploadedDocs.dlPassportVoter && (
                <button onClick={() => setPreviewFile({ url: uploadedDocs.dlPassportVoter, label: "DL / Passport / VoterID" })} style={{ ...styles.uploadBtn, background: "#059669" }}>👁️ DL/Passport</button>
              )}
              {/* Extra uploads */}
              {dashSchema.uploads_extra.map(u => {
                const url = customFieldValues[`upload_${u.id}`];
                if (!url) return null;
                return (
                  <button key={u.id} onClick={() => setPreviewFile({ url, label: u.label })} style={{ ...styles.uploadBtn, background: "#059669" }}>
                    👁️ {u.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Membership Details</h3>
            <PreviewTable rows={[
              ["Membership Number", memberDetails.membershipNo],
              ["Member Class", memberDetails.memberClass],
              ["Assets Class", memberDetails.assetClass],
              ["Valid Till", memberDetails.validTill],
            ]} />
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Qualification Details</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead><tr>{["Qualification", "Year", "% Marks", "Board/Univ", "College", "File"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {eduRows.filter(r => r.qualification).map((row, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{row.qualification || "—"}</td>
                      <td style={styles.td}>{row.year || "—"}</td>
                      <td style={styles.td}>{row.marks || "—"}</td>
                      <td style={styles.td}>{row.board || "—"}</td>
                      <td style={styles.td}>{row.college || "—"}</td>
                      <td style={styles.td}>
                        {row.fileName ? (
                          <button 
                            type="button"
                            onClick={() => setPreviewFile({ url: row.fileName, label: row.qualification || "Education Document" })}
                            style={{ ...styles.uploadBtn, background: "#059669", padding: "2px 8px", fontSize: 10 }}
                          >
                            👁️ View
                          </button>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ ...styles.sectionCard, marginBottom: 24 }}>
            <h3 style={styles.sectionTitle}>Experience Details</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead><tr>{["Status", "Years", "From", "To", "Employer", "Designation", "Area", "File"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {expRows.filter(r => r.employer).map((row, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{row.status || "—"}</td>
                      <td style={styles.td}>{row.years || "—"}</td>
                      <td style={styles.td}>{row.from || "—"}</td>
                      <td style={styles.td}>{row.to || "—"}</td>
                      <td style={styles.td}>{row.employer || "—"}</td>
                      <td style={styles.td}>{row.designation || "—"}</td>
                      <td style={styles.td}>{row.area || "—"}</td>
                      <td style={styles.td}>
                        {row.fileName ? (
                          <button 
                            type="button"
                            onClick={() => setPreviewFile({ url: row.fileName, label: row.employer || "Experience Document" })}
                            style={{ ...styles.uploadBtn, background: "#059669", padding: "2px 8px", fontSize: 10 }}
                          >
                            👁️ View
                          </button>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {hasPaid ? (
              <div style={{ background: "#d1f7e8", color: "#0f6e56", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                ✓ Payment Completed
              </div>
            ) : (
              <PayButton allSectionsValid={allSectionsValid} token={token} />
            )}
          </div>
        </div>
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      </div>
    );
  }

  const paymentsArray = Array.isArray(payments) ? payments : [];
  const completedPayments = paymentsArray.filter(p => p && (p.status === "Success" || p.status === "Completed"));
  const totalPaidVal = completedPayments.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);
  const sortedCompleted = [...completedPayments].sort((a, b) => new Date(b?.paidAt || 0) - new Date(a?.paidAt || 0));
  const lastPaymentVal = sortedCompleted[0];
  let nextDueVal = "—";
  let nextDueDate = "—";
  if (lastPaymentVal) {
    const paidAtDate = lastPaymentVal.paidAt ? new Date(lastPaymentVal.paidAt) : null;
    const isValidDate = paidAtDate && !isNaN(paidAtDate.getTime());
    const paidYear = isValidDate ? paidAtDate.getFullYear() : new Date().getFullYear();
    const paidMonth = isValidDate ? paidAtDate.getMonth() : new Date().getMonth();
    const fyEndYear = paidMonth < 3 ? paidYear : paidYear + 1;
    nextDueVal = "₹2,000";
    nextDueDate = `31 Mar ${fyEndYear}`;
  }

  const payCardsData = [
    { label: "Total Paid", value: `₹${totalPaidVal.toLocaleString("en-IN")}`, sub: "Paid to date" },
    { 
      label: "Last Payment", 
      value: lastPaymentVal ? `₹${(parseFloat(lastPaymentVal.amount) || 0).toLocaleString("en-IN")}` : "₹0", 
      sub: lastPaymentVal && lastPaymentVal.paidAt ? new Date(lastPaymentVal.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" 
    },
    { label: "Next Due", value: nextDueVal, sub: nextDueDate }
  ];

  // ── MAIN DASHBOARD ──
  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <div style={styles.brand}>COV <span style={{ color: "#00a6a6" }}>India</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={styles.userPill}>
            <div style={styles.avatar}>{getInitials()}</div>
            <span style={styles.userName}>{getDisplayName()}</span>
          </div>
          <button onClick={() => logout()} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={styles.memberInfoBar}>
        <span style={styles.memberTitle}>{isGuest ? "Guest Profile" : "Member Profile"}</span>
        <InfoChip label="Membership No" value={topInfo.membershipNo || "—"} />
        <InfoChip label="Member Class" value={topInfo.memberClass || "—"} />
        <InfoChip label="Assets Class" value={topInfo.assetClass || "—"} />
        <InfoChip label="Status" value={<span style={topInfo.status === "Active" ? styles.badgeActive : styles.badgePending}>{topInfo.status || "Pending"}</span>} />
        {!isGuest && <button style={styles.previewBtn} onClick={() => setShowPreview(true)}>Preview Details</button>}
      </div>

      <div style={styles.mainLayout}>
        <div style={{ ...styles.sidebar, width: sidebarCollapsed ? 64 : 220, minWidth: sidebarCollapsed ? 64 : 220 }}>
          <div style={styles.sidebarHeader}>
            {!sidebarCollapsed ? <div style={styles.sidebarTitle}>Menu</div> : <div style={styles.sidebarMiniTitle}>M</div>}
            <button
              type="button"
              style={styles.sidebarToggle}
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
              title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
          </div>
          {sidebarItems
            .filter(item => dashSchema.page_visibility[item.key] !== false)
            .filter(item => {
              if (isGuest) {
                return item.key === "events" || item.key === "payment";
              }
              return true;
            })
            .map(item => (
              <div key={item.key}
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === item.key ? styles.sidebarItemActive : {}),
                  ...(sidebarCollapsed ? styles.sidebarItemCollapsed : {})
                }}
                onClick={() => setActiveTab(item.key)}>
                <span style={{ fontSize: 15, width: 20, minWidth: 20, textAlign: "center" }}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </div>
            ))}
          <div style={styles.sidebarDivider} />
          {/* Admin-added custom sections in sidebar */}
          {dashSchema.custom_sections.map(section => {
            if (isGuest) return null;
            return (
              <div key={section.id}
                style={{
                  ...styles.sidebarItem,
                  ...(activeTab === section.id ? styles.sidebarItemActive : {}),
                  ...(sidebarCollapsed ? styles.sidebarItemCollapsed : {})
                }}
                onClick={() => setActiveTab(section.id)}>
                <span style={{ fontSize: 15, width: 20, minWidth: 20, textAlign: "center" }}>📋</span>
                {!sidebarCollapsed && section.label}
              </div>
            );
          })}
          {!isGuest && dashSchema.custom_sections.length > 0 && <div style={styles.sidebarDivider} />}
          <div
            style={{
              ...styles.sidebarItem,
              ...(activeTab === "password" ? styles.sidebarItemActive : {}),
              ...(sidebarCollapsed ? styles.sidebarItemCollapsed : {})
            }}
            onClick={() => setActiveTab("password")}
          >
            <span style={{ fontSize: 15, width: 20, minWidth: 20, textAlign: "center" }}>🔒</span>
            {!sidebarCollapsed && "Change Password"}
          </div>
        </div>

        {/* Lock overlay — blocks all input interaction when form is locked */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {isLocked && !["payment", "scrutiny", "password"].includes(activeTab) && (
            <div
              title="Form is locked. Contact admin to unlock."
              style={{
                position: "absolute", inset: 0, zIndex: 10,
                cursor: "not-allowed",
                background: "rgba(241,245,249,0.45)",
                backdropFilter: "blur(0.5px)",
              }}
            />
          )}
          <div style={{
            opacity: (isLocked && !["payment", "scrutiny", "password"].includes(activeTab)) ? 0.65 : 1,
            userSelect: (isLocked && !["payment", "scrutiny", "password"].includes(activeTab)) ? "none" : "auto"
          }}>

            {/* ── PERSONAL ── */}
            {activeTab === "personal" && (
              <>
                <SectionCard title="Personal Details">
                  <div style={styles.formGrid}>
                    <FormGroup label="Title">
                      <select style={styles.input} value={personal.title} onChange={e => setPersonal({ ...personal, title: e.target.value })}>
                        {["Mr.", "Ms.", "Dr.", "Prof."].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Gender">
                      <select style={styles.input} value={personal.gender} onChange={e => setPersonal({ ...personal, gender: e.target.value })}>
                        {["Male", "Female", "Other"].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="First Name (as per PAN) *">
                      <input style={styles.input} value={personal.firstName} onChange={e => setPersonal({ ...personal, firstName: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Last Name (as per PAN) *">
                      <input style={styles.input} value={personal.lastName} onChange={e => setPersonal({ ...personal, lastName: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Father / Husband Name">
                      <input style={styles.input} value={personal.fatherName} onChange={e => setPersonal({ ...personal, fatherName: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Date of Birth (as per PAN) *">
                      <input type="date" style={styles.input} value={personal.dob} onChange={e => setPersonal({ ...personal, dob: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Email Address *">
                      <input type="email" style={{ ...styles.input, ...styles.inputReadonly }} value={personal.email} readOnly />
                    </FormGroup>
                    <FormGroup label="Mobile Number *">
                      <input type="tel" style={{ ...styles.input, ...styles.inputReadonly }} value={personal.mobile} readOnly />
                    </FormGroup>
                    {/* Admin-added fields render inline inside Personal Details — not in a separate section */}
                    {dashSchema.personal_extra.map(field => (
                      <FormGroup key={field.id} label={field.label}>
                        {field.type === "select" ? (
                          <select style={styles.input} value={customFieldValues[field.id] || ""}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}>
                            <option value="">Select {field.label}</option>
                            {(field.options || []).map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea style={{ ...styles.input, minHeight: 60, gridColumn: "1/-1" }} placeholder={`Enter ${field.label}`}
                            value={customFieldValues[field.id] || ""}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                        ) : (
                          <input type={field.type} style={styles.input} placeholder={`Enter ${field.label}`}
                            value={customFieldValues[field.id] || ""}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                        )}
                      </FormGroup>
                    ))}
                  </div>
                </SectionCard>
                <SectionCard title="Upload Documents">
                  <div style={styles.uploadRow}>
                    <UploadBox label="Profile Picture *" hint="JPG/PNG, max 2MB" icon={ICONS.user}
                      preview={picturePreview}
                      savedName={uploadedDocs.picture}
                      inputRef={pictureRef} accept="image/*"
                      onView={(url, label) => setPreviewFile({ url, label })}
                      onChange={e => { const f = e.target.files[0]; handleDocUpload("picture", f, setPicturePreview); }} />
                    <UploadBox label="Signature *" hint="JPG/PNG, max 1MB" icon={ICONS.signature}
                      preview={signaturePreview}
                      savedName={uploadedDocs.signature}
                      inputRef={signatureRef} accept="image/*"
                      onView={(url, label) => setPreviewFile({ url, label })}
                      onChange={e => { const f = e.target.files[0]; handleDocUpload("signature", f, setSignaturePreview); }} />
                    <UploadBox label="PAN Card *" hint="PDF/JPG, max 2MB" icon={ICONS.card}
                      fileName={panFileName}
                      savedName={uploadedDocs.pan}
                      inputRef={panRef} accept=".pdf,.jpg,.jpeg,.png"
                      onView={(url, label) => setPreviewFile({ url, label })}
                      onChange={e => { const f = e.target.files[0]; if (f) { setPanFileName(f.name); handleDocUpload("pan", f, null); } }} />
                    <UploadBox label="Aadhar Card *" hint="PDF/JPG, max 2MB" icon={ICONS.card}
                      fileName={aadharFileName}
                      savedName={uploadedDocs.aadhar}
                      inputRef={aadharRef} accept=".pdf,.jpg,.jpeg,.png"
                      onView={(url, label) => setPreviewFile({ url, label })}
                      onChange={e => { const f = e.target.files[0]; if (f) { setAadharFileName(f.name); handleDocUpload("aadhar", f, null); } }} />
                    <UploadBox label="DL / Passport / VoterID" hint="PDF/JPG, max 2MB" icon={ICONS.passport}
                      fileName={uploadedDocs.dlPassportVoter ? "" : (dlPassportVoterRef.current?.files[0]?.name || "")}
                      savedName={uploadedDocs.dlPassportVoter}
                      inputRef={dlPassportVoterRef} accept=".pdf,.jpg,.jpeg,.png"
                      onView={(url, label) => setPreviewFile({ url, label })}
                      onChange={e => { const f = e.target.files[0]; if (f) handleDocUpload("dlPassportVoter", f, null); }} />
                    {/* Admin-added upload boxes render inline inside Upload Documents */}
                    {dashSchema.uploads_extra.map(item => (
                      <ExtraUploadBox
                        key={item.id}
                        item={item}
                        icon={ICONS.doc}
                        savedFileName={customFieldValues[`upload_${item.id}`] || ""}
                        onView={(url, label) => setPreviewFile({ url, label })}
                        onFilePicked={(id, name) => setCustomFieldValues(prev => ({ ...prev, [`upload_${id}`]: name }))}
                      />
                    ))}
                  </div>
                </SectionCard>

                <NavButtons onSave={savePersonal} saving={saving} onNext={goNext} onBack={null} isLocked={isLocked} />
              </>
            )}

            {/* ── ADDRESS ── */}
            {activeTab === "address" && (
              <>
                <SectionCard title="Permanent Address">
                  <div style={styles.formGrid}>
                    <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={styles.label}>Address Line 1 *</label>
                      <input style={styles.input} placeholder="House/Flat No, Street" value={permAddress.line1} onChange={e => handlePermChange("line1", e.target.value)} />
                    </div>
                    <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={styles.label}>Address Line 2</label>
                      <input style={styles.input} placeholder="Locality, Area" value={permAddress.line2} onChange={e => handlePermChange("line2", e.target.value)} />
                    </div>
                    <FormGroup label="City *"><input style={styles.input} placeholder="City" value={permAddress.city} onChange={e => handlePermChange("city", e.target.value)} /></FormGroup>
                    <FormGroup label="State *">
                      <select style={styles.input} value={permAddress.state} onChange={e => handlePermChange("state", e.target.value)}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="District"><input style={styles.input} placeholder="District" value={permAddress.district} onChange={e => handlePermChange("district", e.target.value)} /></FormGroup>
                    <FormGroup label="Pincode *"><input style={styles.input} placeholder="Pincode" value={permAddress.pincode} onChange={e => handlePermChange("pincode", e.target.value)} /></FormGroup>
                  </div>
                </SectionCard>
                <SectionCard title="Correspondence Address">
                  <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer", fontSize: 14, color: "#002b5b", fontWeight: 500 }}>
                    <input type="checkbox" checked={sameAsMain} onChange={e => handleSameAsMain(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#00a6a6", cursor: "pointer" }} />
                    Same as Permanent Address
                  </label>
                  <div style={styles.formGrid}>
                    <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={styles.label}>Address Line 1</label>
                      <input style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} placeholder="House/Flat No, Street" value={corrAddress.line1} readOnly={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, line1: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={styles.label}>Address Line 2</label>
                      <input style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} placeholder="Locality, Area" value={corrAddress.line2} readOnly={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, line2: e.target.value })} />
                    </div>
                    <FormGroup label="City"><input style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} placeholder="City" value={corrAddress.city} readOnly={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, city: e.target.value })} /></FormGroup>
                    <FormGroup label="State">
                      <select style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} value={corrAddress.state} disabled={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, state: e.target.value })}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="District"><input style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} placeholder="District" value={corrAddress.district} readOnly={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, district: e.target.value })} /></FormGroup>
                    <FormGroup label="Pincode"><input style={{ ...styles.input, ...(sameAsMain ? styles.inputReadonly : {}) }} placeholder="Pincode" value={corrAddress.pincode} readOnly={sameAsMain} onChange={e => setCorrAddress({ ...corrAddress, pincode: e.target.value })} /></FormGroup>
                  </div>
                </SectionCard>
                <SectionCard title="GST & Corporate Billing Details (Optional)">
                  <div style={styles.formGrid}>
                    <FormGroup label="GSTIN (GST Number)">
                      <input style={styles.input} placeholder="15-digit GSTIN (e.g. 27AAAAA1111A1Z1)" value={gstDetails.gstNumber} onChange={e => {
                        const val = e.target.value.toUpperCase().slice(0, 15);
                        let sCode = gstDetails.stateCode;
                        if (val.length >= 2) {
                          sCode = val.slice(0, 2);
                        }
                        setGstDetails(prev => ({ ...prev, gstNumber: val, stateCode: sCode }));
                      }} />
                    </FormGroup>
                    <FormGroup label="Company Name">
                      <input style={styles.input} placeholder="Registered Corporate/Company Name" value={gstDetails.companyName} onChange={e => setGstDetails(prev => ({ ...prev, companyName: e.target.value }))} />
                    </FormGroup>
                    <FormGroup label="Billing State">
                      <select style={styles.input} value={gstDetails.state} onChange={e => {
                        const stateName = e.target.value;
                        const stateCode = STATE_CODE_MAP[stateName] || "";
                        setGstDetails(prev => ({ ...prev, state: stateName, stateCode }));
                      }}>
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="State Code">
                      <input style={{ ...styles.input, ...styles.inputReadonly }} value={gstDetails.stateCode} readOnly placeholder="Auto-populated" />
                    </FormGroup>
                    <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", gap: 5 }}>
                      <label style={styles.label}>Corporate Billing Address</label>
                      <textarea style={{ ...styles.input, minHeight: 60 }} placeholder="Complete corporate billing address" value={gstDetails.billingAddress} onChange={e => setGstDetails(prev => ({ ...prev, billingAddress: e.target.value }))} />
                    </div>
                  </div>
                </SectionCard>
                <NavButtons onSave={saveAddress} saving={saving} onNext={goNext} onBack={goBack} isLocked={isLocked} activeTab={activeTab} />
              </>
            )}

            {/* ── EDUCATION ── */}
            {activeTab === "education" && (
              <>
                <SectionCard title="Educational Qualification">
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {/* If admin has customised columns, use full array; else use defaults */}
                          {(dashSchema.edu_cols && dashSchema.edu_cols.length > 0
                            ? dashSchema.edu_cols
                            : [{ id: "qualification", label: "Qualification", type: "select" }, { id: "year", label: "Year", type: "text" }, { id: "marks", label: "% Marks", type: "text" }, { id: "board", label: "Board/Univ", type: "text" }, { id: "college", label: "College", type: "text" }, { id: "upload", label: "Upload", type: "file" }]
                          ).map(col => <th key={col.id} style={styles.th}>{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {eduRows.map((row, i) => (
                          <tr key={i}>
                            {(dashSchema.edu_cols && dashSchema.edu_cols.length > 0
                              ? dashSchema.edu_cols
                              : [{ id: "qualification", type: "select" }, { id: "year", type: "text" }, { id: "marks", type: "text" }, { id: "board", type: "text" }, { id: "college", type: "text" }, { id: "upload", type: "file" }]
                            ).map(col => {
                              if (col.id === "upload") return (
                                <td key="upload" style={styles.td}>
                                  <button style={styles.uploadBtn} type="button" onClick={() => eduFileRefs.current[i]?.click()}>Upload</button>
                                  {row.fileName && (
                                    <button 
                                      type="button"
                                      onClick={() => setPreviewFile({ url: row.fileName, label: row.qualification || "Education Document" })}
                                      style={{ ...styles.uploadBtn, background: "#059669", padding: "2px 8px", fontSize: 10, display: "block", marginTop: 4 }}
                                    >
                                      👁️ Preview
                                    </button>
                                  )}
                                  <input type="file" accept=".pdf,.jpg,.png" style={{ display: "none" }} ref={el => (eduFileRefs.current[i] = el)}
                                    onChange={e => uploadTableFile("edu", i, e.target.files[0])} />
                                </td>
                              );
                              if (col.id === "qualification") return (
                                <td key="qualification" style={styles.td}>
                                  <select style={styles.tableInput} value={row.qualification} onChange={e => { const r = [...eduRows]; r[i].qualification = e.target.value; setEduRows(r); }}>
                                    <option value="">Select</option>
                                    {["10th", "12th", "Graduate", "Postgraduate"].map(q => <option key={q}>{q}</option>)}
                                  </select>
                                </td>
                              );
                              if (col.type === "file") return (
                                <td key={col.id} style={styles.td}>
                                  <button style={styles.uploadBtn} type="button">Upload</button>
                                </td>
                              );
                              if (col.type === "select") return (
                                <td key={col.id} style={styles.td}>
                                  <select style={styles.tableInput} value={row[col.id] || ""} onChange={e => { const r = [...eduRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setEduRows(r); }}>
                                    <option value="">Select</option>
                                    {(col.options || []).map(o => <option key={o}>{o}</option>)}
                                  </select>
                                </td>
                              );
                              return (
                                <td key={col.id} style={styles.td}>
                                  <input style={styles.tableInput} type={col.type || "text"} value={row[col.id] || ""} placeholder={col.label}
                                    onChange={e => { const r = [...eduRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setEduRows(r); }} />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button style={styles.addRowBtn} onClick={() => setEduRows([...eduRows, { qualification: "", year: "", marks: "", board: "", college: "", fileName: "" }])}>+ Add Row</button>
                </SectionCard>
                <SectionCard title="Professional Qualification">
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {(dashSchema.pro_cols && dashSchema.pro_cols.length > 0
                            ? dashSchema.pro_cols
                            : [{ id: "qualification", label: "Qualification", type: "text" }, { id: "institute", label: "Institute", type: "text" }, { id: "membershipNo", label: "Membership No.", type: "text" }, { id: "year", label: "Year", type: "text" }, { id: "validity", label: "Validity", type: "text" }, { id: "upload", label: "Upload", type: "file" }]
                          ).map(col => <th key={col.id} style={styles.th}>{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {proRows.map((row, i) => (
                          <tr key={i}>
                            {(dashSchema.pro_cols && dashSchema.pro_cols.length > 0
                              ? dashSchema.pro_cols
                              : [{ id: "qualification", type: "text" }, { id: "institute", type: "text" }, { id: "membershipNo", type: "text" }, { id: "year", type: "text" }, { id: "validity", type: "text" }, { id: "upload", type: "file" }]
                            ).map(col => {
                              if (col.id === "upload") return (
                                <td key="upload" style={styles.td}>
                                  <button style={styles.uploadBtn} type="button" onClick={() => proFileRefs.current[i]?.click()}>Upload</button>
                                  {row.fileName && (
                                    <button 
                                      type="button"
                                      onClick={() => setPreviewFile({ url: row.fileName, label: row.qualification || "Professional Certificate" })}
                                      style={{ ...styles.uploadBtn, background: "#059669", padding: "2px 8px", fontSize: 10, display: "block", marginTop: 4 }}
                                    >
                                      👁️ Preview
                                    </button>
                                  )}
                                  <input type="file" accept=".pdf,.jpg,.png" style={{ display: "none" }} ref={el => (proFileRefs.current[i] = el)}
                                    onChange={e => uploadTableFile("pro", i, e.target.files[0])} />
                                </td>
                              );
                              if (col.type === "file") return (
                                <td key={col.id} style={styles.td}><button style={styles.uploadBtn} type="button">Upload</button></td>
                              );
                              if (col.type === "select") return (
                                <td key={col.id} style={styles.td}>
                                  <select style={styles.tableInput} value={row[col.id] || ""} onChange={e => { const r = [...proRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setProRows(r); }}>
                                    <option value="">Select</option>
                                    {(col.options || []).map(o => <option key={o}>{o}</option>)}
                                  </select>
                                </td>
                              );
                              return (
                                <td key={col.id} style={styles.td}>
                                  <input style={styles.tableInput} type={col.type || "text"} value={row[col.id] || ""} placeholder={col.label}
                                    onChange={e => { const r = [...proRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setProRows(r); }} />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button style={styles.addRowBtn} onClick={() => setProRows([...proRows, { qualification: "", institute: "", membershipNo: "", year: "", validity: "", fileName: "" }])}>+ Add Row</button>
                </SectionCard>
                <NavButtons onSave={saveEducation} saving={saving} onNext={goNext} onBack={goBack} isLocked={isLocked} />
              </>
            )}

            {/* ── WORK ── */}
            {activeTab === "work" && (
              <>
                <SectionCard title="Work Experience">
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {(dashSchema.exp_cols && dashSchema.exp_cols.length > 0
                            ? dashSchema.exp_cols
                            : [{ id: "status", label: "Status", type: "select" }, { id: "years", label: "Total Years", type: "text" }, { id: "from", label: "From", type: "text" }, { id: "to", label: "To", type: "text" }, { id: "employer", label: "Employer", type: "text" }, { id: "designation", label: "Designation", type: "text" }, { id: "area", label: "Area", type: "text" }, { id: "upload", label: "Upload", type: "file" }]
                          ).map(col => <th key={col.id} style={styles.th}>{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {expRows.map((row, i) => (
                          <tr key={i}>
                            {(dashSchema.exp_cols && dashSchema.exp_cols.length > 0
                              ? dashSchema.exp_cols
                              : [{ id: "status", type: "select" }, { id: "years", type: "text" }, { id: "from", type: "text" }, { id: "to", type: "text" }, { id: "employer", type: "text" }, { id: "designation", type: "text" }, { id: "area", type: "text" }, { id: "upload", type: "file" }]
                            ).map(col => {
                              if (col.id === "upload") return (
                                <td key="upload" style={styles.td}>
                                  <button style={styles.uploadBtn} type="button" onClick={() => expFileRefs.current[i]?.click()}>Upload</button>
                                  {row.fileName && (
                                    <button 
                                      type="button"
                                      onClick={() => setPreviewFile({ url: row.fileName, label: row.employer || "Experience Document" })}
                                      style={{ ...styles.uploadBtn, background: "#059669", padding: "2px 8px", fontSize: 10, display: "block", marginTop: 4 }}
                                    >
                                      👁️ Preview
                                    </button>
                                  )}
                                  <input type="file" accept=".pdf,.jpg,.png" style={{ display: "none" }} ref={el => (expFileRefs.current[i] = el)}
                                    onChange={e => uploadTableFile("exp", i, e.target.files[0])} />
                                </td>
                              );
                              if (col.id === "status") return (
                                <td key="status" style={styles.td}>
                                  <select style={styles.tableInput} value={row.status} onChange={e => { const r = [...expRows]; r[i].status = e.target.value; setExpRows(r); }}>
                                    <option value="">Select</option><option>Employment</option><option>Practice</option>
                                  </select>
                                </td>
                              );
                              if (col.type === "file") return (
                                <td key={col.id} style={styles.td}>
                                  <button style={styles.uploadBtn} type="button">Upload</button>
                                </td>
                              );
                              if (col.type === "select") return (
                                <td key={col.id} style={styles.td}>
                                  <select style={styles.tableInput} value={row[col.id] || ""} onChange={e => { const r = [...expRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setExpRows(r); }}>
                                    <option value="">Select</option>
                                    {(col.options || []).map(o => <option key={o}>{o}</option>)}
                                  </select>
                                </td>
                              );
                              return (
                                <td key={col.id} style={styles.td}>
                                  <input style={styles.tableInput} type={col.type || "text"} value={row[col.id] || ""} placeholder={col.label}
                                    onChange={e => { const r = [...expRows]; r[i] = { ...r[i], [col.id]: e.target.value }; setExpRows(r); }} />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button style={styles.addRowBtn} onClick={() => setExpRows([...expRows, { status: "", years: "", from: "", to: "", employer: "", designation: "", area: "", fileName: "" }])}>+ Add Row</button>
                </SectionCard>
                <SectionCard title="Declaration">
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {termsQuestions.map(q => (
                      <li key={q.name} style={{ borderBottom: "0.5px solid #e8f4f8" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "14px 0", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13.5, color: "#012a4a", flex: 1, lineHeight: 1.6 }}>{q.text}</span>
                          <RadioGroup name={q.name} />
                        </div>
                        {q.hasSubList && (
                          <ul style={{ listStyle: "none", padding: "0 0 0 24px", margin: 0 }}>
                            {subQuestions.map(sq => (
                              <li key={sq.name} style={{ borderTop: "0.5px solid #f0f0f0" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "12px 0", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 13, color: "#444", flex: 1, lineHeight: 1.6 }}>{sq.text}</span>
                                  <RadioGroup name={sq.name} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
                <NavButtons onSave={saveExperience} saving={saving} onNext={goNext} onBack={goBack} isLocked={isLocked} />
              </>
            )}

            {/* ── MEMBER DETAILS ── */}
            {activeTab === "membership" && (
              <SectionCard title="Member Details">
                <div style={styles.formGrid}>

                  {/* Temp Membership ID — read only */}
                  <FormGroup label="Membership Number (Auto-generated)">
                    <input style={{ ...styles.input, ...styles.inputReadonly, fontWeight: 600, color: "#002b5b" }}
                      value={memberDetails.membershipNo || "Generating..."} readOnly />
                  </FormGroup>

                  {/* Member Class */}
                  <FormGroup label="Member Class *">
                    <select style={styles.input} value={memberDetails.memberClass}
                      onChange={e => setMemberDetails({ ...memberDetails, memberClass: e.target.value, assetClass: "" })}>
                      <option value="">Select Member Class</option>
                      {Object.keys(MEMBER_ASSET_MAP).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FormGroup>

                  {/* Asset Class */}
                  <FormGroup label="Assets Class *">
                    {memberDetails.memberClass === "Non-Member" ? (
                      <input style={{ ...styles.input, ...styles.inputReadonly }} value="Not required for Non-Member" readOnly />
                    ) : assetOptions.length > 0 ? (
                      <select style={styles.input} value={memberDetails.assetClass}
                        onChange={e => setMemberDetails({ ...memberDetails, assetClass: e.target.value })}>
                        <option value="">Select Asset Class</option>
                        {assetOptions.map(a => <option key={a}>{a}</option>)}
                      </select>
                    ) : (
                      <input style={{ ...styles.input, ...styles.inputReadonly }} value="Select a Member Class first" readOnly />
                    )}
                  </FormGroup>

                </div>

                {(memberDetails.memberClass || memberDetails.assetClass) && (
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdfc", borderRadius: 8, border: "1px solid #00a6a6", fontSize: 13, color: "#007070" }}>
                    ℹ️ Top bar will update after pressing <strong>Save Changes</strong>.
                  </div>
                )}

                {/* Admin-added extra fields in Member Details */}
                {dashSchema.member_extra.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#002b5b", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #e8f4f8" }}>
                      Additional Member Information
                    </div>
                    <div style={styles.formGrid}>
                      {dashSchema.member_extra.map(field => (
                        <FormGroup key={field.id} label={field.label}>
                          {field.type === "select" ? (
                            <select style={styles.input} value={customFieldValues[field.id] || ""}
                              onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}>
                              <option value="">Select {field.label}</option>
                              {(field.options || []).map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                          ) : field.type === "textarea" ? (
                            <textarea style={{ ...styles.input, minHeight: 60, gridColumn: "1/-1" }}
                              placeholder={`Enter ${field.label}`}
                              value={customFieldValues[field.id] || ""}
                              onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                          ) : (
                            <input type={field.type || "text"} style={styles.input}
                              placeholder={`Enter ${field.label}`}
                              value={customFieldValues[field.id] || ""}
                              onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                          )}
                        </FormGroup>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                  <button style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={saveMemberDetails} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button style={{ ...styles.saveBtn, background: "#00a6a6", padding: "10px 24px" }}
                    onClick={() => {
                      if (!validateSection("membership")) {
                        const missing = getMissingFieldsForTab("membership");
                        showSaveMsg("⚠️ Missing: " + missing.join(", "));
                        return;
                      }
                      saveMemberDetails();
                      setTimeout(() => setShowPreview(true), 500);
                    }}>
                    Next & Preview →
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ── PAYMENT ── */}
            {activeTab === "payment" && (
              <>
                <div style={styles.payCards}>
                  {payCardsData.map(c => (
                    <div key={c.label} style={styles.payCard}>
                      <div style={styles.payLabel}>{c.label}</div>
                      <div style={styles.payValue}>{c.value}</div>
                      <div style={styles.paySub}>{c.sub}</div>
                    </div>
                  ))}
                </div>
                <SectionCard title="Transaction History">
                  {paymentsArray.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px", color: "#6b8099" }}>
                      No payment transactions found.
                    </div>
                  ) : (
                    paymentsArray.map((tx, i) => {
                      const isCompleted = tx && (tx.status === "Success" || tx.status === "Completed");
                      const title = tx && tx.memberType ? `${tx.memberType} Fee` : "Membership Fee";
                      const date = tx && tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                      const matchingInvoice = tx && Array.isArray(invoices) ? invoices.find(inv => inv.paymentOrderId === tx.orderId) : null;
                      const invoiceNumber = matchingInvoice ? matchingInvoice.invoiceNumber : null;
                      return (
                        <div key={(tx && tx._id) || i} style={styles.txRow}>
                          <div>
                            <div style={styles.txTitle}>{title}</div>
                            <div style={styles.txDate}>
                              {date}
                              {tx && tx.orderId ? ` · Order ID: ${tx.orderId}` : ""}
                              {invoiceNumber ? ` · Invoice: ${invoiceNumber}` : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={isCompleted ? styles.badgeSuccess : styles.badgePending}>{(tx && tx.status) || "Pending"}</span>
                            <span style={{ ...styles.txAmount, color: !isCompleted ? "#856404" : "#0f6e56" }}>
                              ₹{(tx && parseFloat(tx.amount) || 0).toLocaleString("en-IN")}
                            </span>
                            {isCompleted && (
                              <button
                                onClick={() => printGSTInvoice({ tempMembershipId: memberDetails.membershipNo || topInfo.membershipNo }, tx, showSaveMsg)}
                                style={{
                                  background: "linear-gradient(135deg, #002b5b, #004080)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  marginLeft: 8,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                🧾 Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </SectionCard>
              </>
            )}

            {/* ── EVENT REGISTRATIONS ── */}
            {activeTab === "events" && (
              <SectionCard title="My Event Registrations">
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: "#6b8099", marginTop: 0 }}>
                    Manage your event registrations and complete pending payments for upcoming events.
                  </p>
                </div>
                
                {eventRegistrations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, background: "#f8fafc", borderRadius: 12 }}>
                    <p style={{ color: "#64748b", fontSize: 16 }}>You haven't registered for any events yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 16 }}>
                    {eventRegistrations.map((ev) => (
                      <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 24, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <div>
                          <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{ev.title}</h3>
                          <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#64748b" }}>
                            <span>📅 {ev.date}</span>
                            <span>💰 {ev.fee} (Member Rate)</span>
                          </div>
                        </div>
                        <div>
                          {ev.status === "Pending" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#eab308", background: "#fef9c3", padding: "4px 12px", borderRadius: 20 }}>Payment Pending</span>
                              <PayButton allSectionsValid={true} token={token} eventId={ev.id} />
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", background: "#dcfce7", padding: "6px 16px", borderRadius: 20 }}>Confirmed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ── SCRUTINY ── */}
            {activeTab === "scrutiny" && (
              <SectionCard title="Scrutiny Status">
                {/* Dynamic status banner */}
                <div style={{
                  padding: "20px 24px",
                  borderRadius: 12,
                  marginBottom: 28,
                  background: scrutinyStatus === "Accepted" ? "#d1fae5"
                    : scrutinyStatus === "Rejected" ? "#fee2e2"
                      : scrutinyStatus === "Hold" ? "#e0e7ff"
                        : "#fff3cd",
                  border: `1px solid ${scrutinyStatus === "Accepted" ? "#6ee7b7"
                    : scrutinyStatus === "Rejected" ? "#fca5a5"
                      : scrutinyStatus === "Hold" ? "#a5b4fc"
                        : "#fcd34d"}`,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{ fontSize: 32 }}>
                    {scrutinyStatus === "Accepted" ? "✅"
                      : scrutinyStatus === "Rejected" ? "❌"
                        : scrutinyStatus === "Hold" ? "⏸"
                          : "⏳"}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 17, fontWeight: 700,
                      color: scrutinyStatus === "Accepted" ? "#065f46"
                        : scrutinyStatus === "Rejected" ? "#991b1b"
                          : scrutinyStatus === "Hold" ? "#3730a3"
                            : "#92610a"
                    }}>
                      {scrutinyStatus === "Accepted" && "Your form has been Accepted!"}
                      {scrutinyStatus === "Rejected" && "Your form has been Rejected"}
                      {scrutinyStatus === "Hold" && "Your form is currently on Hold"}
                      {scrutinyStatus === "Pending" && "Your application is under review"}
                      {!scrutinyStatus && "Application submitted — awaiting review"}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b8099", marginTop: 4 }}>
                      {scrutinyStatus === "Accepted" && "Congratulations! Your membership has been approved by the admin. You will receive a confirmation shortly."}
                      {scrutinyStatus === "Rejected" && "Unfortunately your application was not approved. Please contact admin for more information."}
                      {scrutinyStatus === "Hold" && "Your application is currently on hold. Admin may require additional documents or information."}
                      {(scrutinyStatus === "Pending" || !scrutinyStatus) && "Your application has been received and is being reviewed by our team. This may take a few working days."}
                    </div>
                  </div>
                </div>

                {/* Progress timeline */}
                {[
                  {
                    title: "Application Submitted",
                    note: "Your registration has been received successfully.",
                    done: true,
                    date: "Completed",
                  },
                  {
                    title: "Documents Submitted",
                    note: "Please ensure all qualification, experience and personal details are filled.",
                    done: true,
                    date: "Completed",
                  },
                  {
                    title: "Under Review by Admin",
                    note: "Your application is currently being reviewed by the membership committee.",
                    done: ["Pending", "Accepted", "Hold", "Rejected"].includes(scrutinyStatus),
                    date: scrutinyStatus ? "In Progress" : "Pending",
                  },
                  {
                    title: "Final Decision",
                    note: scrutinyStatus === "Accepted" ? "Your form has been accepted by the admin."
                      : scrutinyStatus === "Rejected" ? "Your form was rejected. Contact admin for details."
                        : scrutinyStatus === "Hold" ? "Your form is on hold. Admin will update you soon."
                          : "Awaiting admin decision.",
                    done: ["Accepted", "Rejected", "Hold"].includes(scrutinyStatus),
                    date: scrutinyStatus === "Accepted" ? "Accepted ✓"
                      : scrutinyStatus === "Rejected" ? "Rejected"
                        : scrutinyStatus === "Hold" ? "On Hold"
                          : "Pending",
                    statusColor: scrutinyStatus === "Accepted" ? "#00a6a6"
                      : scrutinyStatus === "Rejected" ? "#ef4444"
                        : scrutinyStatus === "Hold" ? "#818cf8"
                          : "#dee2e6",
                  },
                  {
                    title: "Membership Active",
                    note: "Your membership card and certificate will be issued.",
                    done: scrutinyStatus === "Accepted",
                    date: scrutinyStatus === "Accepted" ? "Active" : "Pending",
                  },
                ].map((step, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ ...styles.stepDot, background: step.statusColor || (step.done ? "#00a6a6" : "#dee2e6") }} />
                      {i < arr.length - 1 && <div style={styles.stepConnector} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 24 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: step.done ? "#012a4a" : "#aaa" }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: step.done ? "#6b8099" : "#bbb", marginTop: 2 }}>{step.date}</div>
                      {step.done && step.note && <div style={styles.stepNote}>{step.note}</div>}
                    </div>
                  </div>
                ))}

                {/* Contact admin note */}
                <div style={{ marginTop: 8, padding: "12px 16px", background: "#f2f9ff", borderRadius: 8, border: "1px solid rgba(0,43,91,0.1)", fontSize: 13, color: "#6b8099" }}>
                  📧 Have questions about your application status? Contact us at <strong>covindiaforum@gmail.com</strong>
                </div>
              </SectionCard>
            )}

            {/* ── PASSWORD ── */}
            {activeTab === "password" && (
              <SectionCard title="Change Password">
                <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
                  <FormGroup label="Current Password"><input type="password" style={styles.input} placeholder="Enter current password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} /></FormGroup>
                  <FormGroup label="New Password"><input type="password" style={styles.input} placeholder="Enter new password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} /></FormGroup>
                  <FormGroup label="Confirm New Password"><input type="password" style={styles.input} placeholder="Confirm new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></FormGroup>
                  <button onClick={handlePasswordUpdate} disabled={saving} style={{ ...styles.saveBtn, width: "fit-content", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ── ADMIN-ADDED CUSTOM SECTIONS ── */}
            {dashSchema.custom_sections.map(section => (
              activeTab === section.id && (
                <SectionCard key={section.id} title={section.label}>
                  <p style={{ fontSize: 13, color: "#6b8099", marginBottom: 16 }}>
                    Please fill in the following information.
                  </p>
                  <div style={styles.formGrid}>
                    {section.fields.map(field => (
                      <FormGroup key={field.id} label={field.label}>
                        {field.type === "textarea" ? (
                          <textarea style={{ ...styles.input, minHeight: 70 }} placeholder={`Enter ${field.label}`}
                            value={customFieldValues[field.id] || ""}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                        ) : (
                          <input type={field.type || "text"} style={styles.input} placeholder={`Enter ${field.label}`}
                            value={customFieldValues[field.id] || ""}
                            onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} />
                        )}
                      </FormGroup>
                    ))}
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button style={styles.saveBtn} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </SectionCard>
              )
            ))}

          </div>
        </div>
      </div>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

/* ── HELPER COMPONENTS ── */
function ExtraUploadBox({ item, onFilePicked, savedFileName, onView }) {
  const fileRef = useRef(null);
  return (
    <div
      style={{ ...styles.uploadBox, borderColor: savedFileName ? "#00a6a6" : undefined }}
      onClick={() => fileRef.current?.click()}>
      <div style={{ fontSize: 24, marginBottom: 8, color: savedFileName ? "#059669" : "#00a6a6", display: 'flex', justifyContent: 'center' }}>
        {savedFileName ? (
          <div style={{ position: 'relative' }}>
            {onView ? ICONS.doc : "📄"}
            <div style={{ position: 'absolute', top: -5, right: -5, background: '#059669', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>✓</div>
          </div>
        ) : (onView ? ICONS.doc : "📄")}
      </div>
      <div style={styles.uploadLabel}>{item.label}</div>
      <div style={styles.uploadHint}>{item.hint}</div>
      {savedFileName && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(savedFileName, item.label); }}
            style={{ ...styles.uploadBtn, background: "#059669", padding: "4px 10px", fontSize: 11 }}
          >
            👁️ Preview
          </button>
        </div>
      )}
      <input
        type="file"
        ref={fileRef}
        accept={item.accept}
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files[0];
          if (f && onFilePicked) onFilePicked(item.id, f.name);
        }}
      />
    </div>
  );
}
function UploadBox({ label, hint, icon, preview, fileName, savedName, inputRef, accept, onChange, onView }) {
  // If we have a preview (local blob) or a savedName (URL), we can show a preview/button
  const isImage = accept.includes("image");

  return (
    <div style={{ ...styles.uploadBox, borderColor: (fileName || savedName) ? "#00a6a6" : undefined }} onClick={() => inputRef.current.click()}>
      {preview || (isImage && savedName) ? (
        <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={preview || getDrivePreview(savedName)} 
            alt={label} 
            style={{ width: '100%', height: '100%', objectFit: "cover", borderRadius: 8, position: 'absolute', zIndex: 2 }} 
            onError={(e) => { e.target.style.opacity = 0; }}
          />
          <div style={{ fontSize: 24, color: "#00a6a6", zIndex: 1 }}>{icon}</div>
          {savedName && (
            <div style={{ position: 'absolute', top: -5, right: -5, background: '#059669', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', zIndex: 3 }}>✓</div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 24, marginBottom: 8, color: (fileName || savedName) ? "#059669" : "#00a6a6", display: 'flex', justifyContent: 'center' }}>
          {savedName ? (
            <div style={{ position: 'relative' }}>
              {icon}
              <div style={{ position: 'absolute', top: -5, right: -5, background: '#059669', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>✓</div>
            </div>
          ) : icon}
        </div>
      )}
      
      <div style={styles.uploadLabel}>{label}</div>
      <div style={styles.uploadHint}>{hint}</div>

      {(fileName || savedName) && (
        <div style={{ marginTop: 10 }}>
          {savedName ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onView(savedName, label); }}
              style={{ ...styles.uploadBtn, background: "#059669", padding: "4px 10px", fontSize: 11 }}
            >
              👁️ Preview
            </button>
          ) : (
            <div style={{ fontSize: 11, color: "#00a6a6", fontWeight: 500 }}>
              📎 Ready to Save
            </div>
          )}
        </div>
      )}
      <input type="file" ref={inputRef} accept={accept} style={{ display: "none" }} onChange={onChange} />
    </div>
  );
}

function FilePreviewModal({ file, onClose }) {
  if (!file) return null;
  const isPdf = file.url.toLowerCase().includes(".pdf") || file.url.toLowerCase().includes("view") || file.url.toLowerCase().includes("preview");
  
  // Convert Drive view link to preview link for iframe
  let previewUrl = file.url;
  if (previewUrl.includes("drive.google.com")) {
    previewUrl = previewUrl.replace("/view", "/preview");
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{file.label}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.modalBody}>
          {isPdf ? (
            <iframe src={previewUrl} style={{ width: "100%", height: "70vh", border: "none" }} title="Preview" />
          ) : (
            <img src={getDrivePreview(file.url)} alt="Preview" style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />
          )}
        </div>
      </div>
    </div>
  );
}

function NavButtons({ onSave, saving, onNext, isLocked, onBack, activeTab }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {onBack && (
          <button style={{ ...styles.saveBtn, background: "#6b8099" }} onClick={onBack}>← Back</button>
        )}
        <button
          style={{ ...styles.saveBtn, opacity: (saving || isLocked) ? 0.7 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}
          onClick={isLocked ? undefined : onSave}
          disabled={saving || isLocked}
        >
          {isLocked ? "🔒 Form Locked" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {activeTab !== "membership" && (
        <button style={{ ...styles.saveBtn, background: "#00a6a6" }} onClick={onNext}>Next →</button>
      )}
    </div>
  );
}

function PreviewTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i}>
            <td style={{ padding: "8px 12px", color: "#6b8099", fontWeight: 500, width: "45%", borderBottom: "0.5px solid #e8f4f8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</td>
            <td style={{ padding: "8px 12px", color: "#012a4a", borderBottom: "0.5px solid #e8f4f8", fontWeight: 500 }}>{value || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={styles.sectionCard}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={styles.chipLabel}>{label}</span>
      <span style={styles.chipValue}>{value}</span>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: "'Segoe UI', sans-serif", background: "#f2f9ff", minHeight: "100vh", color: "#012a4a", marginTop: "100px" },
  topBar: { background: "#002b5b", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { color: "#fff", fontSize: 18, fontWeight: 600 },
  userPill: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", borderRadius: 50, padding: "6px 14px 6px 8px" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#00a6a6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" },
  userName: { color: "#fff", fontSize: 13 },
  memberInfoBar: { background: "#fff", borderBottom: "1px solid rgba(0,43,91,0.12)", padding: "18px 28px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" },
  memberTitle: { fontSize: 17, fontWeight: 600, color: "#002b5b", marginRight: 8 },
  chipLabel: { fontSize: 11, color: "#6b8099", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 },
  chipValue: { fontSize: 14, fontWeight: 600, color: "#012a4a" },
  badgePending: { background: "#fff3cd", color: "#856404", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeActive: { background: "#d1f7e8", color: "#0f6e56", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeSuccess: { background: "#d1f7e8", color: "#0f6e56", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  previewBtn: { marginLeft: "auto", background: "#00a6a6", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  mainLayout: { display: "flex", padding: "24px 28px", gap: 22, alignItems: "flex-start" },
  sidebar: { width: 220, flexShrink: 0, background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,43,91,0.12)", overflowY: "auto", overflowX: "hidden", maxHeight: "calc(100vh - 150px)", transition: "width 0.2s ease" },
  sidebarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px", borderBottom: "0.5px solid rgba(0,43,91,0.1)", marginBottom: 2 },
  sidebarTitle: { fontSize: 12, fontWeight: 800, color: "#6b8099", textTransform: "uppercase", letterSpacing: "0.8px" },
  sidebarToggle: { background: "#f2f9ff", border: "1px solid rgba(0,43,91,0.12)", color: "#002b5b", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, flexShrink: 0 },
  sidebarItem: { display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", fontSize: 13.5, cursor: "pointer", color: "#012a4a", borderLeft: "3px solid transparent", borderBottom: "0.5px solid rgba(0,43,91,0.1)", transition: "padding 0.2s ease, justify-content 0.2s ease" },
  sidebarItemCollapsed: { justifyContent: "center", padding: "13px 10px" },
  sidebarItemActive: { background: "#f2f9ff", borderLeftColor: "#00a6a6", color: "#002b5b", fontWeight: 600 },
  sidebarDivider: { height: 1, background: "rgba(0,43,91,0.1)", margin: "4px 0" },
  sectionCard: { background: "#fff", borderRadius: 12, border: "0.5px solid rgba(0,43,91,0.12)", padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#002b5b", borderBottom: "1px solid #e8f4f8", paddingBottom: 12, marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 12, color: "#6b8099", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { border: "1px solid rgba(0,43,91,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#012a4a", background: "#f2f9ff", outline: "none", fontFamily: "inherit", width: "100%" },
  inputReadonly: { background: "#e8f4f8", color: "#6b8099" },
  saveBtn: { background: "#002b5b", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  uploadRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  uploadBox: { flex: 1, minWidth: 140, border: "1.5px dashed #00a6a6", borderRadius: 10, padding: 20, textAlign: "center", background: "#f0fdfc", cursor: "pointer" },
  uploadLabel: { fontSize: 13, fontWeight: 600, color: "#00a6a6", marginBottom: 4 },
  uploadHint: { fontSize: 12, color: "#6b8099" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: { background: "#f2f9ff", color: "#002b5b", fontWeight: 600, padding: "10px 12px", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px" },
  td: { padding: "10px 12px", borderBottom: "0.5px solid #e8f4f8", color: "#012a4a" },
  tableInput: { border: "1px solid rgba(0,43,91,0.15)", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#f2f9ff", outline: "none", width: "100%" },
  uploadBtn: { background: "#00a6a6", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" },
  addRowBtn: { background: "none", border: "1px dashed #00a6a6", color: "#00a6a6", padding: "7px 16px", borderRadius: 7, fontSize: 13, cursor: "pointer", marginTop: 12 },
  payCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 },
  payCard: { background: "#f2f9ff", borderRadius: 10, border: "0.5px solid rgba(0,43,91,0.12)", padding: 16 },
  payLabel: { fontSize: 11, color: "#6b8099", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  payValue: { fontSize: 22, fontWeight: 600, color: "#002b5b" },
  paySub: { fontSize: 12, color: "#6b8099", marginTop: 2 },
  txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid #e8f4f8" },
  txTitle: { fontSize: 14, fontWeight: 500, color: "#012a4a" },
  txDate: { fontSize: 12, color: "#6b8099", marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: 600 },
  stepDot: { width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 3 },
  stepConnector: { width: 2, flex: 1, minHeight: 30, background: "#e8f4f8", margin: "4px 0" },
  stepNote: { fontSize: 12, color: "#6b8099", marginTop: 4, background: "#f2f9ff", borderRadius: 6, padding: "6px 10px" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
  modalContent: { background: '#fff', borderRadius: 16, width: '90%', maxWidth: 800, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' },
  modalBody: { padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, background: '#fff' }
};

// Helper: generate and open GST invoice in a new tab
async function printGSTInvoice(m, payment, showToast) {
  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    if (!token) {
      if (showToast) showToast("Authentication token not found.", "error");
      else alert("Authentication token not found.");
      return;
    }

    const res = await fetch(`/api/gst/invoices?orderId=${payment.orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!result.success || !result.data || result.data.length === 0) {
      if (showToast) showToast("GST Invoice not found for this payment.", "error");
      else alert("GST Invoice not found for this payment.");
      return;
    }

    const invoice = result.data[0];
    const { companySnapshot, customerSnapshot, items, totalTaxableValue, totalCGST, totalSGST, totalIGST, grandTotal, invoiceNumber, invoiceDate } = invoice;
    const formattedDate = new Date(invoiceDate || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const formattedPaidAt = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("en-IN") : formattedDate;

    // bank details
    const bank = companySnapshot.bankDetails || {};
    const bankHtml = bank.bankName ? `
      <div style="margin-top: 15px; padding: 12px; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 12px; line-height: 1.5; color: #475569; background: #fafafa;">
        <strong style="color: #0f172a;">Bank Details for Payment:</strong><br>
        Bank Name: ${bank.bankName}<br>
        A/C Number: ${bank.accountNumber || "—"}<br>
        IFSC Code: ${bank.ifscCode || "—"}<br>
        Branch: ${bank.branchName || "—"}
      </div>
    ` : "";

    // signatory signature image if available
    const signatory = companySnapshot.authorizedSignatory || {};
    const signatoryHtml = signatory.name ? `
      <div class="seal">
        ${signatory.signatureUrl ? `<img src="${signatory.signatureUrl}" alt="Signature" style="max-height: 50px; display: block; margin-bottom: 5px; margin-left: auto;" />` : `<div style="height: 40px;"></div>`}
        <strong>${companySnapshot.companyName}</strong><br>
        <span style="font-size: 12px; color: #64748b;">${signatory.name} (${signatory.designation || "Authorized Signatory"})</span>
      </div>
    ` : `
      <div class="seal">
        <div style="height: 45px;"></div>
        <strong>${companySnapshot.companyName}</strong>
        <p>Authorized Signatory</p>
      </div>
    `;

    // Dynamic table rows
    const rowsHtml = items.map((item, idx) => {
      const showIGST = item.igstAmount > 0;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${item.description}</strong>
          </td>
          <td>${item.hsnSac || "—"}</td>
          <td style="text-align:right;">₹${item.basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align:right;">${item.discountPercent}% (₹${item.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</td>
          <td style="text-align:right;">₹${item.taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align:right;">${showIGST ? '—' : `${item.cgstPercent}%<br>(₹${item.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}</td>
          <td style="text-align:right;">${showIGST ? '—' : `${item.sgstPercent}%<br>(₹${item.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}</td>
          <td style="text-align:right;">${showIGST ? `${item.igstPercent}%<br>(₹${item.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : '—'}</td>
          <td style="text-align:right; font-weight: bold;">₹${item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join("");

    const isIGST = totalIGST > 0;
    const totalsTableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tbody>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px;">Total Taxable Value</td>
            <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px; text-align: right;">₹${totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ${!isIGST ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px;">CGST Total</td>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px; text-align: right;">₹${totalCGST.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px;">SGST Total</td>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px; text-align: right;">₹${totalSGST.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ` : `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px;">IGST Total</td>
              <td style="padding: 8px; border-bottom: 1px solid #cbd5e1; font-size: 13px; text-align: right;">₹${totalIGST.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `}
          <tr class="grand-total">
            <td style="padding: 10px; font-weight: 800; font-size: 16px; background: #002b5b; color: #fff;">Grand Total (incl. GST)</td>
            <td style="padding: 10px; font-weight: 800; font-size: 16px; text-align: right; background: #002b5b; color: #fff;">₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    `;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GST Invoice ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; color: #334155; }
    .invoice { background: #fff; max-width: 900px; margin: 0 auto; padding: 40px; box-shadow: 0 2px 20px rgba(0,0,0,0.1); border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #002b5b; margin-bottom: 28px; }
    .brand { color: #002b5b; }
    .brand h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .brand h1 span { color: #00a6a6; }
    .brand p { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 22px; font-weight: 800; color: #002b5b; }
    .invoice-meta p { font-size: 12px; color: #64748b; margin-top: 4px; }
    .gst-badge { display: inline-block; background: #002b5b; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .party-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; }
    .party-box h3 { font-size: 11px; font-weight: 800; color: #00a6a6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .party-box p { font-size: 13px; color: #334155; line-height: 1.7; }
    .party-box strong { color: #002b5b; }
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .invoice-table thead th { background: #002b5b; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #1e293b; }
    .invoice-table tbody td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #334155; vertical-align: top; }
    .invoice-table tbody tr:nth-child(even) td { background: #f8fafc; }
    .totals-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .totals-left { width: 55%; }
    .totals-right { width: 40%; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.6; }
    .seal { text-align: right; }
    .seal p { font-size: 11px; color: #94a3b8; margin-top: 10px; }
    .seal strong { font-size: 13px; color: #002b5b; }
    @media print {
      body { background: #fff; padding: 0; color: #000; }
      .invoice { box-shadow: none; padding: 0; border-radius: 0; }
      .no-print { display: none; }
      .invoice-table thead th { background: #002b5b !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .grand-total td { background: #002b5b !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:900px;margin:0 auto 16px;display:flex;gap:12px;">
    <button onclick="window.print()" style="background:#002b5b;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">🖨 Print / Save as PDF</button>
    <button onclick="window.close()" style="background:#e2e8f0;color:#002b5b;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">✕ Close</button>
  </div>
  <div class="invoice">
    <div class="header">
      <div class="brand">
        <h1><span>${companySnapshot.companyName.split(' ')[0]}</span> ${companySnapshot.companyName.split(' ').slice(1).join(' ')}</h1>
        <p>${companySnapshot.companyAddress}</p>
        <p>Email: ${companySnapshot.email} | Ph: ${companySnapshot.phone}</p>
        <div class="gst-badge">GSTIN: ${companySnapshot.gstNumber}</div>
      </div>
      <div class="invoice-meta">
        <h2>TAX INVOICE</h2>
        <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>State:</strong> ${companySnapshot.state} (Code: ${companySnapshot.stateCode})</p>
        <p><strong>PAN:</strong> ${companySnapshot.pan || "—"}</p>
      </div>
    </div>
    <div class="parties">
      <div class="party-box">
        <h3>Billed To (Recipient)</h3>
        <p><strong>${customerSnapshot.companyName || customerSnapshot.name}</strong><br>
        ${customerSnapshot.companyName ? `Attn: ${customerSnapshot.name}<br>` : ""}
        Email: ${customerSnapshot.email}<br>
        Mobile: ${customerSnapshot.phone || "—"}<br>
        Address: ${customerSnapshot.billingAddress || "—"}<br>
        State: ${customerSnapshot.state} (Code: ${customerSnapshot.stateCode})<br>
        ${customerSnapshot.gstNumber ? `<strong>GSTIN:</strong> ${customerSnapshot.gstNumber}` : "<strong>GSTIN:</strong> Unregistered (B2C)"}</p>
      </div>
      <div class="party-box">
        <h3>Transaction Details</h3>
        <p><strong>Order ID:</strong> ${payment.orderId || "—"}<br>
        <strong>Tracking ID:</strong> ${payment.trackingId || "—"}<br>
        <strong>Payment Mode:</strong> ${payment.paymentMode || "Online"}<br>
        <strong>Bank Ref No:</strong> ${payment.bankRefNo || "—"}<br>
        <strong>Payment Date:</strong> ${formattedPaidAt}<br>
        <strong>Membership No:</strong> ${m.tempMembershipId || m.membershipNo || "—"}</p>
      </div>
    </div>
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width: 5%">#</th>
          <th style="width: 25%">Description of Service</th>
          <th style="width: 10%">SAC</th>
          <th style="width: 10%">Base Price</th>
          <th style="width: 10%">Discount</th>
          <th style="width: 10%">Taxable Value</th>
          <th style="width: 10%">CGST</th>
          <th style="width: 10%">SGST</th>
          <th style="width: 10%">IGST</th>
          <th style="width: 10%">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div class="totals-container">
      <div class="totals-left">
        <p style="font-size: 13px; line-height: 1.6;">Amount in words:<br><strong style="color:#002b5b; font-size:14px;">Rupees ${numberToWords(grandTotal)} Only</strong></p>
        ${bankHtml}
      </div>
      <div class="totals-right">
        ${totalsTableHtml}
      </div>
    </div>
    <div class="footer">
      <div>
        <p style="margin-top:10px;">This is a computer-generated tax invoice and does not require a physical signature.<br>For any support or queries, email us at: ${companySnapshot.email}</p>
      </div>
      ${signatoryHtml}
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  } catch (error) {
    if (showToast) showToast("Failed to fetch or generate invoice: " + error.message, "error");
    else alert("Failed to fetch or generate invoice: " + error.message);
  }
}

// Helper: number to words for GST invoice
function numberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
}

export default Dashboard;
