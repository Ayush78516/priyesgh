import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserDashboardEditor from "../components/Admin/UserDashboardEditor";
import EventManager from "../components/Admin/EventManager";
import EventMasterManager from "../components/Admin/EventMasterManager";
import MembershipFeeManager from "../components/Admin/MembershipFeeManager";

// ── ALL PAGES ──
const ALL_PAGES = [
  {
    page: "Home Page", icon: "🏠",
    fields: [
      { key: "hero_title", label: "Hero Heading", type: "text", desc: "The big main heading in the hero section", defaultValue: "Empowering the Valuation Profession" },
      { key: "hero_badge", label: "Hero Badge Text", type: "text", desc: "Small badge label displayed above the hero heading", defaultValue: "INDUSTRY LEADERSHIP" },
      { key: "hero_desc", label: "Hero Description", type: "text", desc: "Paragraph text below the hero heading. Use <br/> for line breaks.", defaultValue: "Future-Ready Valuation Starts Here.<br/>Join a professional institution that advances your credibility, competence, and global standing." },
      { key: "hero_bg", label: "Hero Background Image", type: "image", desc: "Background image of the entire hero section", defaultValue: "" },
      { key: "hero_btn1", label: "Hero Button 1 Text", type: "text", desc: "Text on the primary (dark) button in the hero", defaultValue: "Become a Member" },
      { key: "hero_btn2", label: "Hero Button 2 Text", type: "text", desc: "Text on the secondary (outline) button in the hero", defaultValue: "Explore Services" },
      { key: "about_heading", label: "About Section Heading", type: "text", desc: "Large heading in the About section", defaultValue: "Welcome to Council of Valuers" },
      { key: "about_subheading", label: "About Subheading", type: "text", desc: "Smaller line below the About heading", defaultValue: "Advancing Excellence in Valuation" },
      { key: "about_text", label: "About Paragraph", type: "text", desc: "Main descriptive paragraph in the About section", defaultValue: "At the Council of Valuers (COV), we function as a professional institution committed to strengthening the valuation ecosystem in India through rigour, standards, and informed collaboration." },
      { key: "about_image", label: "About Section Image", type: "image", desc: "Image displayed beside the About text", defaultValue: "" },
      { key: "stats_members", label: "Stats: Members Count", type: "text", desc: "Number shown in the 'Valuers Members Registered' stat box", defaultValue: "2500+" },
      { key: "stats_vpos", label: "Stats: VPOs Count", type: "text", desc: "Number shown in the 'International VPOs Engaged' stat box", defaultValue: "24" },
      { key: "stats_mentors", label: "Stats: Mentors Count", type: "text", desc: "Number shown in the 'Chartered Mentors' stat box", defaultValue: "30" },
      { key: "stats_digital", label: "Stats: Digital %", type: "text", desc: "Number shown in the 'Digital Services' stat box", defaultValue: "100%" },
      { key: "osp_title", label: "OSP Section Title", type: "text", desc: "Heading of the 'One Stop Platform' section", defaultValue: "One Stop Platform (OSP)" },
      { key: "ecosystem_title", label: "Ecosystem Section Title", type: "text", desc: "Heading of the 'Valuation Ecosystem' section", defaultValue: "Valuation Ecosystem" },
      { key: "ecosystem_subtitle", label: "Ecosystem Subtitle", type: "text", desc: "Subtitle below the Ecosystem heading", defaultValue: "Your journey to becoming a trusted valuation professional starts here." },
    ],
  },
  {
    page: "About Us / Our Story", icon: "📖",
    fields: [
      { key: "story_para1", label: "Story Paragraph 1", type: "text", desc: "First paragraph on the Our Story page", defaultValue: "At the Council of Valuers (COV), we function as a professional institution committed to strengthening the valuation ecosystem in India through rigour, standards, and informed collaboration. Conceived as a neutral, inclusive platform, COV provides a structured framework that supports valuers across career stages—students, emerging professionals, experienced practitioners, and institutional stakeholders—while aligning practice with evolving domestic and global benchmarks." },
      { key: "story_para2", label: "Story Paragraph 2", type: "text", desc: "Second paragraph on the Our Story page", defaultValue: "With a focus on integrity, excellence, and global alignment, we promote ethical practice, continuous learning, and international standards — ensuring you are future-ready in a fast-changing valuation environment." },
      { key: "osp_badge", label: "OSP Badge Text", type: "text", desc: "Badge label above the OSP section heading", defaultValue: "Our Technology" },
      { key: "osp_heading", label: "OSP Section Heading", type: "text", desc: "Main heading of the OSP platform section", defaultValue: "Powering Valuers Through Technology: COV's One Stop Platform (OSP)" },
      { key: "osp_subtitle", label: "OSP Subtitle", type: "text", desc: "Subtitle under the OSP section heading", defaultValue: "Our flagship One Stop Platform (OSP) makes professional engagement seamless and impactful. Whether you're an individual practitioner or a service seeker, OSP connects you with trusted, qualified professionals." },
      { key: "mission_heading", label: "Mission Heading", type: "text", desc: "Heading for the Mission section", defaultValue: "Our Mission" },
      { key: "mission_desc", label: "Mission Description", type: "text", desc: "Descriptive text under the Mission heading", defaultValue: "To cultivate a thriving ecosystem where valuation professionals excel through continuous learning, ethical practice, and innovative collaboration—driving sustainable economic impact and setting new benchmarks for the industry worldwide." },
      { key: "vision_heading", label: "Vision Heading", type: "text", desc: "Heading for the Vision section", defaultValue: "Our Vision" },
    ],
  },
  {
    page: "Membership", icon: "🪪",
    fields: [
      // Hero
      { key: "mem_hero_title", label: "Hero Title", type: "text", desc: "Large heading at the top of the Membership page", defaultValue: "Membership at COV" },
      { key: "mem_hero_desc", label: "Hero Description", type: "text", desc: "Paragraph below the Membership hero heading", defaultValue: "At COV, membership is more than a credential—it's a commitment to excellence, integrity, and lifelong learning in the valuation profession. Whether you're a student, an emerging practitioner, or a seasoned expert, we offer a pathway tailored to your stage of professional growth." },
      // Categories section
      { key: "mem_section_title", label: "Categories Section Title", type: "text", desc: "Heading for the 'Membership Categories' section", defaultValue: "Membership Categories" },
      { key: "mem_section_sub", label: "Categories Subtitle", type: "text", desc: "Subtitle below the categories heading", defaultValue: "Supporting valuation professionals through every phase of practice and growth." },
      // Student tab
      { key: "mem_student_title", label: "Student: Tab Title", type: "text", desc: "Title on the Student tab card", defaultValue: "Student Member" },
      { key: "mem_student_tagline", label: "Student: Tagline", type: "text", desc: "Italic tagline under Student title", defaultValue: "Ideal for current students or recent graduates from academic programmes related to valuation, finance, economics, law, engineering, or real estate." },
      { key: "mem_student_desc", label: "Student: Description", type: "text", desc: "Paragraph below the Student tagline", defaultValue: "Becoming a Student Member at COV is the perfect first step toward a rewarding career in valuation. This category provides:" },
      { key: "mem_student_points", label: "Student: Bullet Points", type: "text", desc: "Bullet points (one per line, use newline to separate)", defaultValue: "Early exposure to the global valuation ecosystem\nAccess to learning resources, expert talks, and mentorship opportunities\nPreparation for seamless transition into Affiliate or Chartered membership\nOpportunities to participate in student chapters, case competitions, and forums" },
      { key: "mem_student_closing", label: "Student: Closing Line", type: "text", desc: "Final sentence shown at the bottom of the Student tab", defaultValue: "Join a community that empowers future valuation leaders and supports your growth from the ground up." },
      // Affiliate tab
      { key: "mem_affiliate_title", label: "Affiliate: Tab Title", type: "text", desc: "Title on the Affiliate tab card", defaultValue: "Affiliate Member" },
      { key: "mem_affiliate_tagline", label: "Affiliate: Tagline", type: "text", desc: "Italic tagline under Affiliate title", defaultValue: "Where Learning Transforms into Practice" },
      { key: "mem_affiliate_desc", label: "Affiliate: Description", type: "text", desc: "Paragraph below the Affiliate tagline", defaultValue: "The Affiliate Membership is tailored for early-career professionals or individuals transitioning into the valuation profession." },
      { key: "mem_affiliate_points", label: "Affiliate: Bullet Points", type: "text", desc: "Bullet points (one per line)", defaultValue: "A structured and recognised entry point into professional valuation.\nAccess to CPD programmes, industry-ready training, and expert mentorship.\nExposure to hands-on valuation concepts, case studies, and knowledge-sharing forums.\nBuild your confidence, network, and capability for regulatory and global opportunities." },
      { key: "mem_affiliate_closing", label: "Affiliate: Closing Line", type: "text", desc: "Final sentence at the bottom of the Affiliate tab", defaultValue: "Affiliate Membership is your professional foundation—designed to grow with you." },
      // Chartered tab
      { key: "mem_chartered_title", label: "Chartered: Tab Title", type: "text", desc: "Title on the Chartered tab card", defaultValue: "Chartered Member" },
      { key: "mem_chartered_tagline", label: "Chartered: Tagline", type: "text", desc: "Italic tagline under Chartered title", defaultValue: "Professional Recognition. Global Credibility" },
      { key: "mem_chartered_desc", label: "Chartered: Description", type: "text", desc: "Paragraph below the Chartered tagline", defaultValue: "Chartered Membership represents the core professional grade at COV — designed for individuals who demonstrate a high level of competence, ethical commitment, and applied experience in valuation." },
      { key: "mem_chartered_points", label: "Chartered: Bullet Points", type: "text", desc: "Bullet points (one per line)", defaultValue: "Earn the CM-COV Post-Nominal: A mark of distinction in the valuation profession.\nRecognised Professional Status: Shows you've met rigorous education, experience, and ethical benchmarks.\nAccess to Premium Opportunities: Eligible for technical committees, advanced CPD, thought-leadership forums, and mentoring roles.\nGlobal Readiness: Demonstrates alignment with international standards and ethical valuation practice." },
      // Fellow tab
      { key: "mem_fellow_title", label: "Fellow: Tab Title", type: "text", desc: "Title on the Fellow tab card", defaultValue: "Fellow Member" },
      { key: "mem_fellow_tagline", label: "Fellow: Tagline", type: "text", desc: "Italic tagline under Fellow title", defaultValue: "Where Leadership Meets Legacy" },
      { key: "mem_fellow_desc", label: "Fellow: Description", type: "text", desc: "Paragraph below the Fellow tagline", defaultValue: "The Fellow Membership (FM COV) is the highest recognition awarded by the Council of Valuers, reserved for seasoned professionals who have demonstrated exceptional expertise, leadership, and long-standing contributions to the valuation ecosystem." },
      { key: "mem_fellow_points", label: "Fellow: Bullet Points", type: "text", desc: "Bullet points (one per line)", defaultValue: "Prestigious recognition as a senior leader in the valuation profession.\nEligibility to chair committees, mentor future professionals, and represent COV globally.\nAccess to high-level consultations, expert panels, and policymaking dialogues.\nDemonstrates your role in shaping standards, strategy, and the future of valuation in India and abroad." },
      // Institutional tab
      { key: "mem_inst_title", label: "Institutional: Tab Title", type: "text", desc: "Title on the Institutional tab card", defaultValue: "Institutional Member" },
      { key: "mem_inst_tagline", label: "Institutional: Tagline", type: "text", desc: "Italic tagline under Institutional title", defaultValue: "Strengthening Valuation through Organisational Commitment" },
      { key: "mem_inst_desc", label: "Institutional: Description", type: "text", desc: "Paragraph below the Institutional tagline", defaultValue: "The Corporate & Institutional Membership is designed for valuation firms, academic institutions, training bodies, research centres, and organisations that share COV's commitment to advancing professional standards in valuation." },
      { key: "mem_inst_points", label: "Institutional: Bullet Points", type: "text", desc: "Bullet points (one per line)", defaultValue: "Valuation firms and consultancies\nUniversities, colleges, and research institutions\nSector skill councils, financial institutions, and government agencies\nIndustry associations supporting valuation as a discipline" },
      // Benefits section
      { key: "mem_benefits_title", label: "Benefits Section Title", type: "text", desc: "Heading for the 'Member Benefits' section", defaultValue: "Member Benefits" },
      { key: "mem_benefit_1_title", label: "Benefit 1 Title", type: "text", desc: "Title for benefit card #1", defaultValue: "Professional Recognition" },
      { key: "mem_benefit_1_desc", label: "Benefit 1 Description", type: "text", desc: "Description for benefit card #1", defaultValue: "Your credentials are backed by a reputable institution aligned with international standards." },
      { key: "mem_benefit_2_title", label: "Benefit 2 Title", type: "text", desc: "Title for benefit card #2", defaultValue: "Learning & Development" },
      { key: "mem_benefit_2_desc", label: "Benefit 2 Description", type: "text", desc: "Description for benefit card #2", defaultValue: "Workshops, certifications, webinars, and CPD tracking—designed to keep you future-ready." },
      { key: "mem_benefit_3_title", label: "Benefit 3 Title", type: "text", desc: "Title for benefit card #3", defaultValue: "Global Standards & Tools" },
      { key: "mem_benefit_3_desc", label: "Benefit 3 Description", type: "text", desc: "Description for benefit card #3", defaultValue: "Stay updated with the latest valuation methodologies, IVS-aligned practices, and digital tools." },
      { key: "mem_benefit_4_title", label: "Benefit 4 Title", type: "text", desc: "Title for benefit card #4", defaultValue: "Career Support" },
      { key: "mem_benefit_4_desc", label: "Benefit 4 Description", type: "text", desc: "Description for benefit card #4", defaultValue: "Mentorship, networking events, and listings on COV's One Stop Platform (OSP)." },
      { key: "mem_benefit_5_title", label: "Benefit 5 Title", type: "text", desc: "Title for benefit card #5", defaultValue: "Thought Leadership" },
      { key: "mem_benefit_5_desc", label: "Benefit 5 Description", type: "text", desc: "Description for benefit card #5", defaultValue: "Contribute to journals, working groups, committees, and global initiatives like V20." },
      { key: "mem_benefit_6_title", label: "Benefit 6 Title", type: "text", desc: "Title for benefit card #6", defaultValue: "Collaborative Community" },
      { key: "mem_benefit_6_desc", label: "Benefit 6 Description", type: "text", desc: "Description for benefit card #6", defaultValue: "Engage with peers, industry experts, and stakeholders shaping the valuation profession." },
    ],
  },
  {
    page: "Board of Directors", icon: "👥",
    fields: [
      { key: "bod_hero_title", label: "Page Hero Title", type: "text", desc: "Main heading at the top of the Board of Directors page", defaultValue: "Meet Our Board of Directors" },
      { key: "bod_hero_desc", label: "Page Hero Description", type: "text", desc: "Description paragraph below the BOD page heading", defaultValue: "At COV, our Board of Directors brings together a distinguished group of leaders from diverse fields—including valuation, finance, infrastructure, public policy, and cooperative development." },
    ],
  },
  {
    page: "Committee", icon: "⚖️",
    fields: [
      { key: "committee_title", label: "Page Title", type: "text", desc: "Main heading on the Committee page", defaultValue: "Committee Members" },
      { key: "committee_subtitle", label: "Page Subtitle", type: "text", desc: "Subtitle below the Committee heading", defaultValue: "Meet the dedicated professionals who serve on COV's advisory committees." },
    ],
  },
  {
    page: "Events", icon: "🗓️",
    fields: [
      { key: "events_hero_title", label: "Page Title", type: "text", desc: "Main heading at the top of the Events page", defaultValue: "Events" },
      { key: "events_hero_desc", label: "Page Description", type: "text", desc: "Intro text below the Events heading", defaultValue: "Browse upcoming conferences, meetings, and completed events managed by the admin team." },
    ],
  },
  {
    page: "By-Laws", icon: "📄",
    fields: [
      { key: "bylaws_pdf", label: "Bylaws PDF File", type: "image", desc: "Upload or paste the URL of the COV Bylaws PDF document.", defaultValue: "" },
      { key: "bylaws_hero_title", label: "Page Title", type: "text", desc: "Heading at the top of the By-Laws page", defaultValue: "By-Laws" },
    ],
  },
  {
    page: "Contact", icon: "📞",
    fields: [
      { key: "contact_hero_title", label: "Page Hero Title", type: "text", desc: "Heading at the top of the Contact page", defaultValue: "Get In Touch" },
      { key: "contact_hero_desc", label: "Page Hero Description", type: "text", desc: "Description text below the Contact page heading", defaultValue: "We'd love to hear from you. Reach out to us anytime!" },
      { key: "contact_address", label: "Office Address", type: "text", desc: "Full physical office address shown on the contact page", defaultValue: "House No. 3279, 2nd Floor, Street Number 14, New Ranjit Nagar, New Delhi - 110008" },
      { key: "contact_phone", label: "Phone Number", type: "text", desc: "Phone number displayed on the contact page and footer", defaultValue: "+91 9599099012" },
      { key: "contact_email", label: "Email Address", type: "text", desc: "Email address displayed on the contact page", defaultValue: "covindiaforum@gmail.com" },
      { key: "contact_hours", label: "Working Hours", type: "text", desc: "Office working hours text", defaultValue: "Mon - Sat: 9:00 AM - 5:00 PM | Sunday: Closed" },
      { key: "bank_name", label: "Bank Name", type: "text", desc: "Bank name shown in the bank transfer section", defaultValue: "Yes Bank Ltd" },
      { key: "bank_account", label: "Account Number", type: "text", desc: "Bank account number for direct transfers", defaultValue: "020588700000262" },
      { key: "bank_ifsc", label: "IFSC Code", type: "text", desc: "Bank IFSC code for NEFT/RTGS transfers", defaultValue: "YESB0000205" },
      { key: "bank_branch", label: "Bank Branch", type: "text", desc: "Bank branch name", defaultValue: "Karol Bagh, New Delhi" },
    ],
  },
  {
    page: "Header & Footer", icon: "🔝",
    fields: [
      { key: "logo_url", label: "Site Logo", type: "image", desc: "The COV logo shown in the top navigation bar", defaultValue: "/assets/Logo.avif" },
      { key: "footer_copyright", label: "Footer Copyright Text", type: "text", desc: "Copyright line at the bottom of every page", defaultValue: "© 2025 Confederation of Valuers. All rights reserved." },
      { key: "footer_email", label: "Footer Email", type: "text", desc: "Email address shown in the footer contact section", defaultValue: "covindiaforum@gmail.com" },
      { key: "footer_phone", label: "Footer Phone", type: "text", desc: "Phone number shown in the footer", defaultValue: "+91 9599099012" },
      { key: "footer_address", label: "Footer Address", type: "text", desc: "Address shown in the footer section", defaultValue: "New Delhi, India" },
      { key: "social_facebook", label: "Facebook URL", type: "text", desc: "Full URL of the Facebook page", defaultValue: "https://facebook.com" },
      { key: "social_twitter", label: "Twitter / X URL", type: "text", desc: "Full URL of the Twitter/X profile", defaultValue: "https://twitter.com" },
      { key: "social_linkedin", label: "LinkedIn URL", type: "text", desc: "Full URL of the LinkedIn company page", defaultValue: "https://linkedin.com" },
      { key: "social_instagram", label: "Instagram URL", type: "text", desc: "Full URL of the Instagram profile", defaultValue: "https://instagram.com" },
      { key: "social_whatsapp", label: "WhatsApp Number", type: "text", desc: "WhatsApp number (with country code)", defaultValue: "+91 9599099012" },
    ],
  },
  {
    page: "Login Page", icon: "🔐",
    fields: [
      { key: "login_title", label: "Page Title", type: "text", desc: "Heading shown on the login page card", defaultValue: "Member Login" },
      { key: "login_tab1_label", label: "Tab 1 Label", type: "text", desc: "Label of the first login tab", defaultValue: "Login with Password" },
      { key: "login_tab2_label", label: "Tab 2 Label", type: "text", desc: "Label of the second login tab", defaultValue: "Login with OTP" },
      { key: "login_email_ph", label: "Email Field Placeholder", type: "text", desc: "Placeholder text inside the email input box", defaultValue: "Enter a valid email address" },
      { key: "login_pass_ph", label: "Password Field Placeholder", type: "text", desc: "Placeholder text inside the password input box", defaultValue: "Enter your password" },
      { key: "login_btn_label", label: "Login Button Text", type: "text", desc: "Text on the main login submit button", defaultValue: "LOGIN" },
      { key: "login_forgot_text", label: "Forgot Password Link Text", type: "text", desc: "Text of the 'Forgot password?' link", defaultValue: "Forgot password?" },
      { key: "login_create_text", label: "Create Account Text", type: "text", desc: "The text prompting users to register", defaultValue: "Don't have an account?" },
      { key: "login_create_link", label: "Create Account Link Text", type: "text", desc: "The clickable link text to go to registration", defaultValue: "Create an account" },
      { key: "login_otp_hint", label: "OTP Hint Text", type: "text", desc: "Small hint shown after OTP is sent", defaultValue: "OTP sent to your email. Valid for 10 minutes." },
    ],
  },
  {
    page: "Register Page", icon: "📝",
    fields: [
      { key: "reg_left_image", label: "Left Section Image", type: "image", desc: "The image displayed on the left panel of the registration page", defaultValue: "/assets/soon.jpg" },
      { key: "reg_title", label: "Page Title", type: "text", desc: "Main heading on the registration page", defaultValue: "Create Account" },
      { key: "reg_subtitle", label: "Page Subtitle", type: "text", desc: "Subtitle below the registration heading", defaultValue: "Join us today and start your learning journey" },
      { key: "reg_fname_ph", label: "First Name Placeholder", type: "text", desc: "Placeholder inside the First Name field", defaultValue: "First name" },
      { key: "reg_lname_ph", label: "Last Name Placeholder", type: "text", desc: "Placeholder inside the Last Name field", defaultValue: "Last name" },
      { key: "reg_email_ph", label: "Email Placeholder", type: "text", desc: "Placeholder inside the Email field", defaultValue: "Enter your email address" },
      { key: "reg_phone_ph", label: "Phone Placeholder", type: "text", desc: "Placeholder inside the Phone/Mobile field", defaultValue: "Enter your mobile number" },
      { key: "reg_pass_ph", label: "Password Placeholder", type: "text", desc: "Placeholder inside the Password field", defaultValue: "Create a password" },
      { key: "reg_otp_ph", label: "OTP Placeholder", type: "text", desc: "Placeholder inside the OTP verification field", defaultValue: "Enter 6-digit OTP" },
      { key: "reg_submit_btn", label: "Submit Button Text", type: "text", desc: "Text on the main registration submit button", defaultValue: "Sign Up" },
      { key: "reg_login_text", label: "Already Have Account Text", type: "text", desc: "Text prompting existing users to log in", defaultValue: "Already have an account? Login" },
    ],
  },
  {
    page: "User Dashboard", icon: "👤",
    fields: [
      { key: "dash_brand", label: "Dashboard Brand Name", type: "text", desc: "Brand name shown in the top-left of the user dashboard", defaultValue: "COV India" },
      { key: "dash_member_title", label: "Member Profile Label", type: "text", desc: "Label shown in the member info bar at the top", defaultValue: "Member Profile" },
      { key: "dash_preview_btn", label: "Preview Button Text", type: "text", desc: "Text on the 'Preview Details' button", defaultValue: "Preview Details" },
      { key: "dash_locked_title", label: "Form Locked Banner Title", type: "text", desc: "Title shown in the red banner when the form is locked", defaultValue: "Form Locked" },
      { key: "dash_locked_msg", label: "Form Locked Banner Message", type: "text", desc: "Message shown in the locked form banner", defaultValue: "Your form has been locked after successful payment. Please contact admin if you need to make changes." },
      { key: "dash_save_btn", label: "Save Button Text", type: "text", desc: "Text on the Save Changes button across all tabs", defaultValue: "Save Changes" },
      { key: "dash_next_btn", label: "Next Button Text", type: "text", desc: "Text on the Next → navigation button", defaultValue: "Next →" },
      { key: "dash_preview_heading", label: "Preview Page Heading", type: "text", desc: "Heading shown on the member preview page before payment", defaultValue: "Member Preview" },
      { key: "dash_pay_btn", label: "Payment Button Text", type: "text", desc: "Text on the 'Proceed to Payment' button", defaultValue: "🔒 Proceed to Payment" },
    ],
  },
  {
    page: "Guest Dashboard", icon: "👤",
    fields: [
      { key: "guest_dashboard_title", label: "Dashboard Title", type: "text", desc: "Main title shown on the guest dashboard", defaultValue: "Welcome to your Guest Dashboard" },
      { key: "guest_dashboard_subtitle", label: "Dashboard Subtitle", type: "text", desc: "Subtitle shown on the guest dashboard", defaultValue: "Manage your event registrations and payments here." },
      { key: "guest_event_title", label: "Mock Event Title", type: "text", desc: "Title of the mock event shown in guest dashboard", defaultValue: "Valuation Masterclass 2024" },
      { key: "guest_event_date", label: "Mock Event Date", type: "text", desc: "Date of the mock event shown in guest dashboard", defaultValue: "15th August 2024" },
      { key: "guest_event_fee", label: "Mock Event Fee", type: "text", desc: "Fee of the mock event shown in guest dashboard", defaultValue: "₹5000" },
    ],
  },
  {
    page: "Privacy & Legal", icon: "🔒",
    fields: [
      { key: "privacy_last_updated", label: "Privacy Policy — Last Updated Date", type: "text", desc: "Date shown on the Privacy Policy page", defaultValue: "January 1, 2025" },
      { key: "refund_last_updated", label: "Refund Policy — Last Updated Date", type: "text", desc: "Date shown on the Refund Policy page", defaultValue: "January 1, 2025" },
      { key: "terms_last_updated", label: "Terms & Conditions — Last Updated", type: "text", desc: "Date shown on the Terms & Conditions page", defaultValue: "January 1, 2025" },
      { key: "legal_address", label: "Legal Contact Address", type: "text", desc: "Address shown in the contact box on Privacy/Terms", defaultValue: "COV India Forum, House No. 3279, 2nd Floor, Street Number 14, New Ranjit Nagar, New Delhi - 110008" },
      { key: "legal_email", label: "Legal Contact Email", type: "text", desc: "Email shown in the contact box on Privacy/Terms", defaultValue: "covindiaforum@gmail.com" },
      { key: "legal_phone", label: "Legal Contact Phone", type: "text", desc: "Phone shown in the contact box on Privacy/Terms", defaultValue: "+91 9599099012" },
    ],
  },
];

const SCRUTINY_COLORS = {
  Pending: { bg: "#fff3cd", color: "#92610a" },
  Accepted: { bg: "#d1fae5", color: "#065f46" },
  Hold: { bg: "#e0e7ff", color: "#3730a3" },
  Rejected: { bg: "#fee2e2", color: "#991b1b" },
};

const TABS = [
  { key: "overview", icon: "◈", label: "Overview" },
  { key: "members", icon: "◉", label: "Members" },
  { key: "payments", icon: "₹", label: "Payments" },
  { key: "invoices", icon: "🧾", label: "Invoices" },
  { key: "leads", icon: "📞", label: "Leads" },
  { key: "gst", icon: "GST", label: "GST Master" },
  { key: "fees", icon: "MF", label: "Membership Fees" },
  { key: "cms", icon: "◧", label: "Content & CMS" },
  { key: "events", icon: "EV", label: "Events", subItems: [{ key: "events_members", label: "Members" }, { key: "events_non_members", label: "Non Members" }] },
  { key: "eventMasters", icon: "EM", label: "Event Master" },
  { key: "userTypes", icon: "UT", label: "User Type" },
  { key: "admins", icon: "◎", label: "Team" },
];

const ADMIN_THEME_STORAGE_KEY = "cov_admin_theme";
const ADMIN_SIDEBAR_COLLAPSE_KEY = "cov_admin_dashboard_sidebar_collapsed";
const TEAM_ROLE_MASTER_CMS_KEY = "team_role_master";
const DEFAULT_TEAM_ROLES = ["Sales", "Operations", "Manager", "Admin"];

const ADMIN_THEME_PRESETS = {
  dark: {
    shellBg: "#0a0f1a",
    sidebarBg: "#0d1424",
    surface: "#111827",
    surfaceAlt: "#070d18",
    border: "#1e293b",
    text: "#e2e8f0",
    textStrong: "#ffffff",
    muted: "#64748b",
    mutedAlt: "#475569",
    accent: "#00a6a6",
    accentSoft: "rgba(0,166,166,0.08)",
    accentSoftStrong: "rgba(0,166,166,0.12)",
    accentBorder: "rgba(0,166,166,0.3)",
    topbarBg: "#0d1424",
    tableHeadBg: "#070d18",
    inputBg: "#111827",
    dropdownShadow: "0 16px 48px rgba(0,0,0,0.6)",
    scrollTrack: "#0a0f1a",
    scrollThumb: "#1e293b",
    placeholder: "#334155",
    badgeBorder: "#0a0f1a",
    toolbarBorder: "#1e293b",
  },
  light: {
    shellBg: "#eef4fb",
    sidebarBg: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f4f8fd",
    border: "#d9e3ee",
    text: "#0b1b2b",
    textStrong: "#0b1b2b",
    muted: "#526273",
    mutedAlt: "#6b7280",
    accent: "#006b6b",
    accentSoft: "rgba(0,107,107,0.08)",
    accentSoftStrong: "rgba(0,107,107,0.12)",
    accentBorder: "rgba(0,107,107,0.22)",
    topbarBg: "#ffffff",
    tableHeadBg: "#f0f5fb",
    inputBg: "#ffffff",
    dropdownShadow: "0 16px 40px rgba(15,23,42,0.14)",
    scrollTrack: "#eef4fb",
    scrollThumb: "#c4cfdb",
    placeholder: "#8896a7",
    badgeBorder: "#eef4fb",
    toolbarBorder: "#d9e3ee",
  },
};

const SIDEBAR_GROUPS = [
  { label: "Dashboard", icon: "◈", items: ["overview", "members"] },
  { label: "Finance", icon: "₹", items: ["payments", "invoices", "fees", "gst"] },
  { label: "Content", icon: "◧", items: ["events", "cms", "leads"] },
  { label: "Master", icon: "⚙", items: ["userTypes", "eventMasters"] },
  { label: "Team", icon: "◎", items: ["admins"] },
];

function parseTeamRoles(raw) {
  if (!raw || raw === "__deleted__") return DEFAULT_TEAM_ROLES;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TEAM_ROLES;
    const roles = parsed
      .map((item) => (typeof item === "string" ? item : item?.name))
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    return roles.length ? [...new Set(roles)] : DEFAULT_TEAM_ROLES;
  } catch {
    return DEFAULT_TEAM_ROLES;
  }
}

function getAdminThemeVars(theme) {
  const palette = ADMIN_THEME_PRESETS[theme] || ADMIN_THEME_PRESETS.dark;
  return {
    "--admin-shell-bg": palette.shellBg,
    "--admin-sidebar-bg": palette.sidebarBg,
    "--admin-surface": palette.surface,
    "--admin-surface-alt": palette.surfaceAlt,
    "--admin-border": palette.border,
    "--admin-text": palette.text,
    "--admin-text-strong": palette.textStrong,
    "--admin-muted": palette.muted,
    "--admin-muted-alt": palette.mutedAlt,
    "--admin-accent": palette.accent,
    "--admin-accent-soft": palette.accentSoft,
    "--admin-accent-soft-strong": palette.accentSoftStrong,
    "--admin-accent-border": palette.accentBorder,
    "--admin-topbar-bg": palette.topbarBg,
    "--admin-table-head-bg": palette.tableHeadBg,
    "--admin-input-bg": palette.inputBg,
    "--admin-dropdown-shadow": palette.dropdownShadow,
    "--admin-scroll-track": palette.scrollTrack,
    "--admin-scroll-thumb": palette.scrollThumb,
    "--admin-placeholder": palette.placeholder,
    "--admin-badge-border": palette.badgeBorder,
    "--admin-toolbar-border": palette.toolbarBorder,
    colorScheme: theme === "light" ? "light" : "dark",
  };
}

// ══════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════
export default function AdminDashboard() {
  const { admin: user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalRegistrations: 0, pendingScrutiny: 0, totalRevenue: 0 });
  const [members, setMembers] = useState([]);
  const [cms, setCms] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ADMIN_SIDEBAR_COLLAPSE_KEY) === "1";
  });
  const [collapsedGroups, setCollapsedGroups] = useState({
    dashboard: false,
    finance: true,
    content: true,
    master: true,
    team: true,
  });
  const [expandedSubGroups, setExpandedSubGroups] = useState({});
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(ADMIN_THEME_STORAGE_KEY) || "dark";
  });

  // Notification state
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [prevMemberCount, setPrevMemberCount] = useState(0);
  const [newMemberNotifs, setNewMemberNotifs] = useState([]);
  const [readNotifs, setReadNotifs] = useState(false);
  const [readMessages, setReadMessages] = useState(false);

  const isSuperAdmin = user?.role === "super-admin";
  const canManageTeam = user?.role === "admin" || user?.role === "super-admin";
  const themeVars = useMemo(() => getAdminThemeVars(theme), [theme]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin");
      } else if (user.role !== "admin" && user.role !== "super-admin") {
        navigate("/");
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore persistence failures.
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SIDEBAR_COLLAPSE_KEY, sidebarCollapsed ? "1" : "0");
    } catch {
      // Ignore persistence failures.
    }
  }, [sidebarCollapsed]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sRes, mRes, invRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/gst/invoices", { headers }),
      ]);
      const [sd, md, invd] = await Promise.all([sRes.json(), mRes.json(), invRes.json()]);
      if (sd.success) setStats(sd.data);
      if (md.success) {
        const newMembers = md.data;
        // Detect new registrations for notification bell
        if (prevMemberCount > 0 && newMembers.length > prevMemberCount) {
          const added = newMembers.slice(0, newMembers.length - prevMemberCount);
          setNewMemberNotifs(prev => [...added.map(m => ({
            id: m._id,
            name: `${m.firstName} ${m.lastName}`,
            email: m.email,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          })), ...prev].slice(0, 10));
          setReadNotifs(false);
        }
        setPrevMemberCount(newMembers.length);
        setMembers(newMembers);
      }
      if (invd.success) setInvoices(invd.data || []);
    } catch { showToast("Failed to load data", "error"); }
    setLoading(false);
  };

  const fetchCMS = async () => {
    try {
      const res = await fetch(`/api/admin/cms?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCms(data.data);
    } catch { showToast("Failed to load CMS", "error"); }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch { showToast("Failed to load admins", "error"); }
  };

  // Fetch contact messages
  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contact", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data || []);
        setReadMessages(false);
      }
    } catch {
      // Contact endpoint may not exist yet — ignore
    }
  };

  useEffect(() => {
    fetchAll();
    fetchCMS();
    fetchContacts();
    if (canManageTeam) fetchAdmins();
    // Poll every 60s for new members/messages
    const interval = setInterval(() => { fetchAll(); fetchContacts(); }, 60000);
    return () => clearInterval(interval);
  }, [authLoading, canManageTeam]);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusUpdate = async (userId, scrutinyStatus) => {
    // Optimistic: update UI instantly before API call
    setSelectedMember(prev => prev?._id === userId ? { ...prev, scrutinyStatus } : prev);
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, scrutinyStatus } : m));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scrutinyStatus }),
      });
      if (res.ok) {
        showToast(`Status updated to ${scrutinyStatus}`);
        // Do NOT call fetchAll here — it would overwrite the optimistic state
        // Stats will sync on next manual refresh or 60s poll
      } else {
        showToast("Update failed", "error");
        fetchAll(); // revert on failure
      }
    } catch {
      showToast("Update failed", "error");
      fetchAll();
    }
  };

  const handleLockToggle = async (userId, isLocked) => {
    // Optimistic: update UI instantly
    setSelectedMember(prev => prev?._id === userId ? { ...prev, isLocked } : prev);
    setMembers(prev => prev.map(m => m._id === userId ? { ...m, isLocked } : m));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isLocked }),
      });
      if (res.ok) {
        showToast(isLocked ? "🔒 Form locked — user cannot edit" : "🔓 Form unlocked — user can now edit");
        // Do NOT call fetchAll here
      } else {
        showToast("Action failed", "error");
        fetchAll();
      }
    } catch {
      showToast("Action failed", "error");
      fetchAll();
    }
  };

  const handleVerifyPayment = async (userId, orderId) => {
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, orderId }),
      });
      if (res.ok) { showToast("Payment verified successfully"); fetchAll(); }
    } catch { showToast("Verification failed", "error"); }
  };

  const filteredMembers = members.filter(m => {
    const matchSearch = !searchQuery ||
      `${m.firstName} ${m.lastName} ${m.email} ${m.tempMembershipId}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === "All" || m.scrutinyStatus === filterStatus;
    return matchSearch && matchFilter;
  });

  const unreadNotifCount = readNotifs ? 0 : newMemberNotifs.length;
  const unreadMsgCount = readMessages ? 0 : contacts.length;
  const themeToggleLabel = theme === "dark" ? "Light mode" : "Dark mode";

  if (!user) return null;

  return (
    <div style={{ ...s.root, ...themeVars }}>
      <style>{globalStyles}</style>

      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#ef4444" : "#00a6a6" }}>
          {toast.type === "error" ? "✕ " : "✓ "}{toast.message}
        </div>
      )}

      {/* Notification dropdown */}
      {showNotifs && (
        <div style={s.dropdown}>
          <div style={s.dropdownHeader}>
            <span style={{ fontWeight: 800, color: "#fff" }}>New Registrations</span>
            <button style={s.dropdownClose} onClick={() => setShowNotifs(false)}>✕</button>
          </div>
          {newMemberNotifs.length === 0 ? (
            <div style={s.dropdownEmpty}>No new registrations yet</div>
          ) : newMemberNotifs.map((n, i) => (
            <div key={i} style={s.dropdownItem}>
              <div style={s.dropdownAvatar}>{n.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{n.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{n.email}</div>
              </div>
              <div style={{ fontSize: 11, color: "#475569" }}>{n.time}</div>
            </div>
          ))}
        </div>
      )}

      {/* Messages dropdown */}
      {showMessages && (
        <div style={{ ...s.dropdown, right: 72, width: 420, maxHeight: "70vh" }}>
          <div style={{ ...s.dropdownHeader, flexDirection: "column", gap: 8, paddingBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <span style={{ fontWeight: 800, color: "#fff" }}>💬 Contact Messages ({contacts.length})</span>
              <button style={s.dropdownClose} onClick={() => setShowMessages(false)}>✕</button>
            </div>
            {contacts.length > 0 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setReadMessages(true); showToast("All messages marked as read"); }}
                  style={{ flex: 1, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", color: "#60a5fa", padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  ✓ Mark All Read
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm(`Delete all ${contacts.length} messages?`)) return;
                    Promise.all(contacts.map(c => c._id
                      ? fetch(`/api/contact/${c._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
                      : Promise.resolve()
                    )).then(() => { setContacts([]); showToast("All messages cleared"); });
                  }}
                  style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  🗑 Clear All
                </button>
              </div>
            )}
          </div>
          {contacts.length === 0 ? (
            <div style={s.dropdownEmpty}>No messages yet</div>
          ) : (
            <div style={{ overflowY: "auto", maxHeight: "calc(70vh - 56px)", display: "flex", flexDirection: "column", gap: 0 }}>
              {contacts.map((c, i) => (
                <ContactMessageCard
                  key={c._id || i}
                  contact={c}
                  token={token}
                  onDelete={() => {
                    setContacts(prev => prev.filter((_, idx) => idx !== i));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ ...s.sidebar, width: sidebarCollapsed ? 72 : 240 }}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>
            {!sidebarCollapsed && <><span style={{ color: "#00a6a6" }}>COV</span> Admin</>}
            {sidebarCollapsed && <span style={{ color: "#00a6a6" }}>C</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={s.themeBtn}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              title={themeToggleLabel}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <button style={s.collapseBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? "→" : "←"}
            </button>
          </div>
        </div>
        <div style={s.sidebarDivider} />
        <nav style={s.sidebarNav}>
          {SIDEBAR_GROUPS.map((group) => {
            const groupKey = group.label.toLowerCase();
            const tabs = group.items
              .map((key) => TABS.find((tab) => tab.key === key))
              .filter(Boolean)
              .filter((tab) => tab.key !== "admins" || canManageTeam);
            if (tabs.length === 0) return null;
            const isGroupCollapsed = collapsedGroups[groupKey] === true;

            return (
              <div key={group.label} style={s.sidebarGroup}>
                {!sidebarCollapsed ? (
                  <button
                    type="button"
                    style={{
                      ...s.sidebarGroupLabelButton,
                      background: isGroupCollapsed ? "var(--admin-surface)" : "transparent",
                      border: isGroupCollapsed ? "1px solid var(--admin-border)" : "1px solid transparent",
                    }}
                    onClick={() => setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "var(--admin-accent)" }}>{group.icon}</span>
                      <span>{group.label}</span>
                    </div>
                    <span style={s.sidebarGroupChevron}>{isGroupCollapsed ? "›" : "⌄"}</span>
                  </button>
                ) : (
                  <div style={{ textAlign: "center", padding: "12px 0", cursor: "pointer", color: "var(--admin-muted-alt)", transition: "all 0.2s" }}
                       onClick={() => { setSidebarCollapsed(false); setCollapsedGroups((prev) => ({ ...prev, [groupKey]: false })) }}>
                    <span style={{ fontSize: 18, color: "var(--admin-accent)" }}>{group.icon}</span>
                  </div>
                )}
                {(!isGroupCollapsed || sidebarCollapsed) && tabs.map((tab) => {
                  const active = activeTab === tab.key;
                  const isSubExpanded = expandedSubGroups[tab.key];
                  
                  return (
                    <div key={tab.key}>
                      <button
                        style={{ ...s.navBtn, ...(active ? s.navBtnActive : {}) }}
                        onClick={() => {
                          setActiveTab(tab.key);
                          if (tab.subItems) {
                            setExpandedSubGroups(prev => ({ ...prev, [tab.key]: !prev[tab.key] }));
                          }
                        }}
                      >
                        <span style={s.navIcon}>{tab.icon}</span>
                        {!sidebarCollapsed && <span style={s.navLabel}>{tab.label}</span>}
                        {tab.subItems && !sidebarCollapsed && (
                          <span style={{ fontSize: 16, transition: "transform 0.3s", transform: isSubExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                            ›
                          </span>
                        )}
                        {active && !sidebarCollapsed && !tab.subItems && <span style={s.navPip} />}
                      </button>
                      
                      {/* Sub-items */}
                      {tab.subItems && isSubExpanded && !sidebarCollapsed && (
                        <div style={{ marginLeft: 34, marginTop: 4, display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
                          <div style={{ position: "absolute", left: -14, top: 0, bottom: 10, width: 2, background: "var(--admin-border)", borderRadius: 2 }} />
                          {tab.subItems.map(sub => {
                            const subActive = activeTab === sub.key;
                            return (
                              <button
                                key={sub.key}
                                style={{
                                  ...s.navBtn,
                                  padding: "8px 12px",
                                  fontSize: 13,
                                  ...(subActive ? s.navBtnActive : {})
                                }}
                                onClick={() => setActiveTab(sub.key)}
                              >
                                <div style={{ position: "absolute", left: -14, top: 16, width: 10, height: 2, background: subActive ? "var(--admin-accent)" : "var(--admin-border)", borderRadius: 2 }} />
                                <span>{sub.label}</span>
                                {subActive && <span style={s.navPip} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div style={{ ...s.sidebarDivider, marginTop: "auto" }} />
        <div style={{ ...s.sidebarUser, ...(sidebarCollapsed ? { flexDirection: "column", gap: 12, paddingBottom: 16 } : {}) }}>
          {sidebarCollapsed && (
            <button style={s.logoutBtn} onClick={() => { logout(true); navigate("/admin"); }} title="Logout">⏻</button>
          )}
          <div style={s.userAvatar}>{user.firstName?.[0]}{user.lastName?.[0]}</div>
          {!sidebarCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.userName}>{user.firstName} {user.lastName}</div>
                <div style={s.userRole}>{user.role}</div>
              </div>
              <button style={s.logoutBtn} onClick={() => { logout(true); navigate("/admin"); }} title="Logout">⏻</button>
            </>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.breadcrumb}>Workspace / {activeTab}</div>
            <h1 style={s.pageTitle}>
              {activeTab === "overview" && "Command Center"}
              {activeTab === "members" && "Member Registry"}
              {activeTab === "payments" && "Payment Registry & Reports"}
              {activeTab === "invoices" && "GST Invoices Registry"}
              {activeTab === "leads" && "Contact Leads CRM"}
              {activeTab === "cms" && "Content Control"}
              {activeTab === "events" && "Event Management"}
              {activeTab === "userTypes" && "User Type Master"}
              {activeTab === "eventMasters" && "Event Master"}
              {activeTab === "admins" && "Team Management"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.livePill}><span style={s.liveDot} />Live</div>
            <button style={s.themeToggle} onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button style={s.refreshBtn} onClick={fetchAll}>↻ Refresh</button>

            {/* Message Bell */}
            <button style={s.iconBtn} title="Contact Messages"
              onClick={() => { setShowMessages(!showMessages); setShowNotifs(false); setReadMessages(true); }}>
              💬
              {unreadMsgCount > 0 && <span style={s.badge}>{unreadMsgCount > 9 ? "9+" : unreadMsgCount}</span>}
            </button>

            {/* Notification Bell */}
            <button style={s.iconBtn} title="New Registrations"
              onClick={() => { setShowNotifs(!showNotifs); setShowMessages(false); setReadNotifs(true); }}>
              🔔
              {unreadNotifCount > 0 && <span style={s.badge}>{unreadNotifCount > 9 ? "9+" : unreadNotifCount}</span>}
            </button>
          </div>
        </div>

        <div style={s.content}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={s.statGrid}>
                <StatCard icon="◈" label="Total Registrations" value={stats.totalRegistrations} accent="#3b82f6" delta="+12%" />
                <StatCard icon="⏳" label="Pending Scrutiny" value={stats.pendingScrutiny} accent="#f59e0b" delta="Review" />
                <StatCard icon="₹" label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`} accent="#00a6a6" delta="+18%" />
                <StatCard icon="◉" label="Total Admins" value={admins.length || "—"} accent="#8b5cf6" delta="Team" />
              </div>
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.cardTitle}>Recent Registrations</span>
                  <button style={s.viewAllBtn} onClick={() => setActiveTab("members")}>View All →</button>
                </div>
                <MemberTable members={members.slice(0, 5)} onSelect={setSelectedMember} onStatus={handleStatusUpdate} compact />
              </div>

              {/* Recent Messages on Overview */}
              {contacts.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardHeader}>
                    <span style={s.cardTitle}>💬 Recent Messages ({contacts.length})</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {contacts.slice(0, 3).map((c, i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "#111827", borderRadius: 10, border: "1px solid #1e293b" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{c.name}</span>
                            <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{c.email}</span>
                          </div>
                          {c.subject && <span style={{ fontSize: 12, color: "#00a6a6", fontWeight: 600 }}>{c.subject}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>{c.message}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
                          <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(`Re: ${c.subject || "Your enquiry to COV India"}`)}&body=${encodeURIComponent(`Dear ${c.name},\n\nThank you for reaching out to us.\n\n`)}`}
                            target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>✉ Reply via Gmail ↗</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={s.cardHeader}><span style={s.cardTitle}>Scrutiny Breakdown</span></div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {["Pending", "Accepted", "Hold", "Rejected"].map(status => {
                    const count = members.filter(m => m.scrutinyStatus === status).length;
                    const colors = SCRUTINY_COLORS[status];
                    return (
                      <div key={status} style={{ ...s.breakdownChip, background: colors.bg, color: colors.color }}>
                        <span style={{ fontSize: 22, fontWeight: 800 }}>{count}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS */}
          {activeTab === "members" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={s.filtersRow}>
                <input style={s.searchInput} placeholder="Search by name, email, membership ID..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  {["All", "Pending", "Accepted", "Hold", "Rejected"].map(f => (
                    <button key={f} style={{ ...s.filterBtn, ...(filterStatus === f ? s.filterBtnActive : {}) }}
                      onClick={() => setFilterStatus(f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={s.card}>
                  <div style={s.cardHeader}><span style={s.cardTitle}>All Members ({filteredMembers.length})</span></div>
                  <MemberTable members={filteredMembers} onSelect={setSelectedMember} onStatus={handleStatusUpdate} selectedId={selectedMember?._id} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <PaymentReportPanel
              members={members}
              invoices={invoices}
              showToast={showToast}
              onSelectMember={(m) => {
                setSelectedMember(m);
              }}
              onVerifyPayment={handleVerifyPayment}
            />
          )}

          {activeTab === "invoices" && (
            <InvoiceReportPanel
              invoices={invoices}
              members={members}
              token={token}
              showToast={showToast}
              onSelectMember={setSelectedMember}
              onRefresh={fetchAll}
            />
          )}

          {activeTab === "gst" && (
            <GSTConfigPanel token={token} showToast={showToast} />
          )}

          {activeTab === "fees" && (
            <MembershipFeeManager
              token={token}
              cms={cms}
              showToast={showToast}
              onUpdate={() => { fetchCMS(); showToast("Published! Changes are live on the website."); }}
            />
          )}

          {/* CMS */}
          {activeTab === "cms" && (
            <CMSPanel cms={cms} token={token}
              onUpdate={() => { fetchCMS(); showToast("Published! Changes are live on the website."); }}
              showToast={showToast} />
          )}


          {(activeTab === "events" || activeTab === "events_members" || activeTab === "events_non_members") && (
            <EventManager
              token={token}
              showToast={showToast}
              cms={cms}
              onUpdate={() => { fetchCMS(); showToast("Published! Changes are live on the website."); }}
              filter={activeTab}
            />
          )}
          {activeTab === "userTypes" && (
            <UserTypeMasterPanel
              token={token}
              cms={cms}
              onUpdate={fetchCMS}
              showToast={showToast}
            />
          )}
          {activeTab === "eventMasters" && (
            <EventMasterManager
              token={token}
              cms={cms}
              showToast={showToast}
              onUpdate={fetchCMS}
            />
          )}
          {/* TEAM */}
          {activeTab === "admins" && canManageTeam && (
            <TeamPanel
              admins={admins}
              token={token}
              cms={cms}
              onRefresh={fetchAdmins}
              showToast={showToast}
            />
          )}

          {activeTab === "leads" && (
            <LeadsCRMPanel admins={admins} token={token} showToast={showToast} />
          )}

          {/* Member details modal available from Members, Payments and Invoices tables */}
          {selectedMember && ["members", "payments", "invoices"].includes(activeTab) && (
            <MemberDetailModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              onStatus={handleStatusUpdate}
              onLock={handleLockToggle}
              onVerifyPayment={handleVerifyPayment}
              token={token}
              showToast={showToast}
            />
          )}

        </div>
      </main>
    </div>
  );
}

// ══════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════
function StatCard({ icon, label, value, accent, delta }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }} className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, color: accent }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{delta}</span>
      </div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════
// MEMBER TABLE
// ══════════════════════════════════════════
function MemberTable({ members, onSelect, onStatus, compact, selectedId }) {
  if (!members.length) return <div style={{ textAlign: "center", padding: "48px", color: "#64748b", fontSize: 14 }}>No members found</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={s.table}>
        <thead>
          <tr>{["Member", "ID", "Class", "Status", "Payment", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {members.map(m => {
            const colors = SCRUTINY_COLORS[m.scrutinyStatus] || SCRUTINY_COLORS.Pending;
            const lastPayment = m.payments?.[m.payments.length - 1];
            return (
              <tr key={m._id} style={{ ...s.tr, ...(selectedId === m._id ? s.trSelected : {}), cursor: "pointer" }}
                onClick={() => onSelect(m)} className="table-row">
                <td style={s.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={s.memberAvatar}>{m.firstName?.[0]}{m.lastName?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{m.firstName} {m.lastName}</div>
                      {!compact && <div style={{ fontSize: 11, color: "#64748b" }}>{m.email}</div>}
                    </div>
                  </div>
                </td>
                <td style={s.td}><code style={s.idCode}>{m.tempMembershipId || "—"}</code></td>
                <td style={s.td}><span style={{ fontSize: 12, color: "#94a3b8" }}>{m.memberDetails?.memberClass || "—"}</span></td>
                <td style={s.td}><span style={{ ...s.statusBadge, background: colors.bg, color: colors.color }}>{m.scrutinyStatus}</span></td>
                <td style={s.td}>
                  {lastPayment
                    ? <span style={{ ...s.statusBadge, background: lastPayment.status === "Completed" ? "#d1fae5" : "#fee2e2", color: lastPayment.status === "Completed" ? "#065f46" : "#991b1b" }}>
                      {lastPayment.status === "Completed" ? `₹${lastPayment.amount}` : "Pending"}
                    </span>
                    : <span style={{ fontSize: 12, color: "#475569" }}>None</span>}
                </td>
                <td style={s.td} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {m.scrutinyStatus !== "Accepted" && <ActionBtn label="Accept" color="#00a6a6" onClick={() => onStatus(m._id, "Accepted")} />}
                    {m.scrutinyStatus !== "Rejected" && <ActionBtn label="Reject" color="#ef4444" onClick={() => onStatus(m._id, "Rejected")} />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════
// PAYMENT REPORT PANEL
// ══════════════════════════════════════════
function PaymentReportPanel({ members, invoices = [], showToast, onSelectMember, onVerifyPayment }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allPayments = useMemo(() => {
    const list = [];
    members.forEach(member => {
      if (member.payments && member.payments.length > 0) {
        member.payments.forEach(payment => {
          const matchingInvoice = invoices.find(inv => inv.paymentOrderId === payment.orderId);
          list.push({
            ...payment,
            _id: payment._id || payment.orderId,
            member: member,
            userName: `${member.firstName} ${member.lastName}`,
            userEmail: member.email,
            tempMembershipId: member.tempMembershipId,
            invoiceId: matchingInvoice ? matchingInvoice._id : null,
            invoiceNumber: matchingInvoice ? matchingInvoice.invoiceNumber : null
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));
  }, [members, invoices]);

  const paymentModes = useMemo(() => {
    const modes = new Set();
    allPayments.forEach(p => {
      if (p.paymentMode) modes.add(p.paymentMode);
    });
    return ["All", ...Array.from(modes)];
  }, [allPayments]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter(p => {
      const searchStr = `${p.userName} ${p.userEmail} ${p.orderId || ''} ${p.trackingId || ''} ${p.tempMembershipId || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || p.status === statusFilter;

      const matchesMode = modeFilter === "All" || p.paymentMode === modeFilter;

      let matchesDate = true;
      if (p.paidAt) {
        const pDate = new Date(p.paidAt);
        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setHours(0, 0, 0, 0);
          if (pDate < sDate) matchesDate = false;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          eDate.setHours(23, 59, 59, 999);
          if (pDate > eDate) matchesDate = false;
        }
      } else if (startDate || endDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesMode && matchesDate;
    });
  }, [allPayments, searchQuery, statusFilter, modeFilter, startDate, endDate]);

  const metrics = useMemo(() => {
    let totalReceived = 0;
    let totalVerified = 0;
    let totalSuccessOnly = 0;
    let pendingCount = 0;

    filteredPayments.forEach(p => {
      const amt = parseFloat(p.amount) || 0;
      if (p.status === "Completed") {
        totalVerified += amt;
        totalReceived += amt;
      } else if (p.status === "Success") {
        totalSuccessOnly += amt;
        totalReceived += amt;
      } else if (p.status === "Pending") {
        pendingCount++;
      }
    });

    return {
      totalReceived,
      totalVerified,
      totalSuccessOnly,
      pendingCount,
      count: filteredPayments.length
    };
  }, [filteredPayments]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={s.statGrid}>
        <StatCard icon="₹" label="Total Revenue (Success + Completed)" value={`₹${metrics.totalReceived.toLocaleString("en-IN")}`} accent="#00a6a6" delta={`Count: ${metrics.count}`} />
        <StatCard icon="✓" label="Verified Revenue (Completed)" value={`₹${metrics.totalVerified.toLocaleString("en-IN")}`} accent="#10b981" delta="Verified" />
        <StatCard icon="⚡" label="Online Success Only" value={`₹${metrics.totalSuccessOnly.toLocaleString("en-IN")}`} accent="#3b82f6" delta="Unverified" />
        <StatCard icon="⏳" label="Pending Payments" value={metrics.pendingCount} accent="#f59e0b" delta="Pending" />
      </div>

      <div style={{ ...s.card, padding: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 250px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Search Payments</label>
            <input
              style={{ ...s.searchInput, width: "100%" }}
              placeholder="Search by name, email, order ID, tracking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Success">Success</option>
              <option value="Aborted">Aborted</option>
              <option value="Failure">Failure</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Mode</label>
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            >
              {paymentModes.map(mode => (
                <option key={mode} value={mode}>{mode === "All" ? "All Modes" : mode}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ flex: "1 1 140px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setModeFilter("All");
              setStartDate("");
              setEndDate("");
            }}
            style={{
              padding: "10px 16px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 10,
              color: "#e2e8f0",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              height: 40
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Payment Transactions ({filteredPayments.length})</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Member / User", "Invoice No", "Order ID", "Date", "Amount", "Mode", "Status", "Action"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#64748b", fontSize: 14 }}>
                    No payment records found matching the filters
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, idx) => {
                  const isCompleted = p.status === "Completed";
                  const isSuccess = p.status === "Success";
                  const statusBg = isCompleted ? "#d1fae5" : isSuccess ? "#dbeafe" : "#fee2e2";
                  const statusColor = isCompleted ? "#065f46" : isSuccess ? "#1e40af" : "#991b1b";

                  return (
                    <tr key={p._id || idx} style={s.tr} className="table-row">
                      <td style={s.td}>
                        <div
                          onClick={() => onSelectMember(p.member)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            transition: "opacity 0.2s"
                          }}
                          className="clickable-name"
                          title="Click to view member details"
                        >
                          <div style={s.memberAvatar}>{p.userName[0]}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6", textDecoration: "underline" }}>
                              {p.userName}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{p.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        {p.invoiceNumber ? (
                          <code style={{ ...s.idCode, color: "#10b981", borderColor: "rgba(16,185,129,0.3)" }}>
                            {p.invoiceNumber}
                          </code>
                        ) : isCompleted ? (
                          <code style={{ ...s.idCode, color: "#cbd5e1", borderColor: "rgba(203,213,225,0.3)" }} title="Invoice generating on server...">
                            Generating...
                          </code>
                        ) : (
                          <span style={{ color: "#475569" }}>—</span>
                        )}
                      </td>
                      <td style={s.td}>
                        <code style={s.idCode}>{p.orderId || "—"}</code>
                        {p.trackingId && <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Track ID: {p.trackingId}</div>}
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) : "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 14, fontWeight: 750, color: "#e2e8f0" }}>
                          ₹{(parseFloat(p.amount) || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.paymentMode || "Online"}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, background: statusBg, color: statusColor }}>
                          {p.status || "Pending"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {!isCompleted && p.orderId && (
                            <button
                              onClick={() => onVerifyPayment(p.member._id, p.orderId)}
                              style={{
                                background: "rgba(0,166,166,0.1)",
                                border: "1px solid rgba(0,166,166,0.3)",
                                color: "#00a6a6",
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Verify
                            </button>
                          )}
                          {isCompleted && (
                            <>
                              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, marginRight: 4 }}>✓ Verified</span>
                              <button
                                onClick={() => {
                                  if (p.invoiceNumber) {
                                    printGSTInvoice(p.member, p, showToast);
                                  } else {
                                    printGSTInvoice(p.member, p, showToast, { autoGenerateIfMissing: true });
                                  }
                                }}
                                style={{
                                  background: "linear-gradient(135deg, #002b5b, #004080)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                                title={p.invoiceNumber ? "View/Print GST Invoice" : "Generate and print GST Invoice"}
                              >
                                {p.invoiceNumber ? "🧾 Invoice" : "✳ Generate Invoice"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvoiceReportPanel({ invoices = [], members = [], token, showToast, onSelectMember, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fyFilter, setFyFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Custom cancellation modal state
  const [cancelModal, setCancelModal] = useState({ isOpen: false, invoiceId: null, invoiceNumber: "", reason: "" });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const custName = inv.customerSnapshot?.name || "";
      const custEmail = inv.customerSnapshot?.email || "";
      const invNo = inv.invoiceNumber || "";
      const orderId = inv.paymentOrderId || "";
      
      const searchStr = `${custName} ${custEmail} ${invNo} ${orderId}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      const matchesFY = fyFilter === "All" || inv.financialYear === fyFilter;

      let matchesDate = true;
      if (inv.invoiceDate) {
        const invDateObj = new Date(inv.invoiceDate);
        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setHours(0, 0, 0, 0);
          if (invDateObj < sDate) matchesDate = false;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          eDate.setHours(23, 59, 59, 999);
          if (invDateObj > eDate) matchesDate = false;
        }
      } else if (startDate || endDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesFY && matchesDate;
    });
  }, [invoices, searchQuery, statusFilter, fyFilter, startDate, endDate]);

  const availableFYs = useMemo(() => {
    const years = new Set();
    invoices.forEach(inv => {
      if (inv.financialYear) years.add(inv.financialYear);
    });
    return ["All", ...Array.from(years).sort().reverse()];
  }, [invoices]);

  const metrics = useMemo(() => {
    let totalInvoices = filteredInvoices.length;
    let totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    let finalizedCount = filteredInvoices.filter(inv => inv.status === "Finalized").length;
    let cancelledCount = filteredInvoices.filter(inv => inv.status === "Cancelled").length;
    return { totalInvoices, totalAmount, finalizedCount, cancelledCount };
  }, [filteredInvoices]);

  const handlePrint = (invoice) => {
    const member = members.find(m => m._id === (invoice.user?._id || invoice.user));
    const payment = {
      orderId: invoice.paymentOrderId,
      trackingId: invoice.paymentTrackingId || "",
      paymentMode: invoice.paymentMode || "Online",
      paidAt: invoice.invoiceDate,
    };
    if (member && member.payments) {
      const actualPayment = member.payments.find(p => p.orderId === invoice.paymentOrderId);
      if (actualPayment) {
        Object.assign(payment, actualPayment);
      }
    }
    printGSTInvoice(member || {}, payment, showToast);
  };

  const handleConfirmCancel = async () => {
    const { invoiceId, invoiceNumber, reason } = cancelModal;
    if (!reason.trim()) {
      showToast("Please provide a reason for cancellation", "error");
      return;
    }
    
    try {
      const res = await fetch(`/api/gst/invoices/${invoiceId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice ${invoiceNumber} cancelled successfully.`);
        setCancelModal({ isOpen: false, invoiceId: null, invoiceNumber: "", reason: "" });
        onRefresh();
      } else {
        showToast(data.message || "Failed to cancel invoice", "error");
      }
    } catch (err) {
      showToast(err.message || "Error cancelling invoice", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* METRICS */}
      <div style={s.statGrid}>
        <StatCard icon="🧾" label="Total Invoices" value={metrics.totalInvoices} accent="#3b82f6" delta="Generated" />
        <StatCard icon="₹" label="Total Amount" value={`₹${metrics.totalAmount.toLocaleString("en-IN")}`} accent="#10b981" delta="Tax & Base" />
        <StatCard icon="✓" label="Finalized Invoices" value={metrics.finalizedCount} accent="#00a6a6" delta="Active" />
        <StatCard icon="✕" label="Cancelled Invoices" value={metrics.cancelledCount} accent="#ef4444" delta="Voided" />
      </div>

      {/* FILTERS */}
      <div style={{ ...s.card, padding: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 250px" }}>
            <label style={s.fieldLabel}>Search Invoices</label>
            <input
              style={{ ...s.searchInput, width: "100%" }}
              placeholder="Search by customer name, email, invoice no, order ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={s.fieldLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            >
              <option value="All">All Statuses</option>
              <option value="Finalized">Finalized</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ flex: "1 1 120px" }}>
            <label style={s.fieldLabel}>Financial Year</label>
            <select
              value={fyFilter}
              onChange={e => setFyFilter(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            >
              {availableFYs.map(fy => (
                <option key={fy} value={fy}>{fy === "All" ? "All FYs" : fy}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1 1 140px" }}>
            <label style={s.fieldLabel}>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ flex: "1 1 140px" }}>
            <label style={s.fieldLabel}>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none" }}
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setFyFilter("All");
              setStartDate("");
              setEndDate("");
            }}
            style={{
              padding: "10px 16px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 10,
              color: "#e2e8f0",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              height: 40
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Invoices Registry ({filteredInvoices.length})</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Invoice No", "Customer", "Date", "FY", "Taxable Value", "GST (CGST/SGST/IGST)", "Grand Total", "Status", "Actions"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#64748b", fontSize: 14 }}>
                    No invoice records found matching the filters
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => {
                  const isFinalized = inv.status === "Finalized";
                  const isCancelled = inv.status === "Cancelled";
                  const statusBg = isFinalized ? "#d1fae5" : isCancelled ? "#fee2e2" : "#fef3c7";
                  const statusColor = isFinalized ? "#065f46" : isCancelled ? "#991b1b" : "#d97706";

                  const totalGst = (inv.totalCGST || 0) + (inv.totalSGST || 0) + (inv.totalIGST || 0);
                  const showIGST = (inv.totalIGST || 0) > 0;
                  const firstItem = Array.isArray(inv.items) && inv.items.length > 0 ? inv.items[0] : null;
                  const igstRate = firstItem?.igstPercent ?? 0;
                  const cgstRate = firstItem?.cgstPercent ?? 0;
                  const sgstRate = firstItem?.sgstPercent ?? 0;

                  const memberObj = members.find(m => m._id === (inv.user?._id || inv.user));

                  return (
                    <tr key={inv._id || idx} style={s.tr} className="table-row">
                      <td style={s.td}>
                        {inv.invoiceNumber ? (
                          <code style={{ ...s.idCode, color: "#10b981", borderColor: "rgba(16,185,129,0.3)" }}>
                            {inv.invoiceNumber}
                          </code>
                        ) : (
                          <span style={{ color: "#475569" }}>—</span>
                        )}
                      </td>
                      <td style={s.td}>
                        {memberObj ? (
                          <div
                            onClick={() => onSelectMember(memberObj)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              cursor: "pointer",
                              transition: "opacity 0.2s"
                            }}
                            className="clickable-name"
                            title="Click to view member details"
                          >
                            <div style={s.memberAvatar}>{inv.customerSnapshot?.name?.[0] || "?"}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6", textDecoration: "underline" }}>
                                {inv.customerSnapshot?.name}
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{inv.customerSnapshot?.email}</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>
                              {inv.customerSnapshot?.name || "Unknown Customer"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{inv.customerSnapshot?.email}</div>
                          </div>
                        )}
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }) : "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{inv.financialYear || "—"}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                          ₹{(inv.totalTaxableValue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                            ₹{totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                            {showIGST ? (
                              `IGST (${igstRate}%): ₹${(inv.totalIGST || 0).toLocaleString("en-IN")}`
                            ) : (
                              `CGST (${cgstRate}%): ₹${(inv.totalCGST || 0).toLocaleString("en-IN")} | SGST (${sgstRate}%): ₹${(inv.totalSGST || 0).toLocaleString("en-IN")}`
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>
                          ₹{(inv.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, background: statusBg, color: statusColor }}>
                          {inv.status || "Draft"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() => handlePrint(inv)}
                            style={{
                              background: "linear-gradient(135deg, #002b5b, #004080)",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}
                            title="View/Print GST Invoice"
                          >
                            🧾 Print
                          </button>
                          {isFinalized && (
                            <button
                              onClick={() => setCancelModal({ isOpen: true, invoiceId: inv._id, invoiceNumber: inv.invoiceNumber, reason: "" })}
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#ef4444",
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                              title="Cancel/Void Invoice"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Cancel Modal */}
      {cancelModal.isOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}
          onClick={() => setCancelModal({ isOpen: false, invoiceId: null, invoiceNumber: "", reason: "" })}>
          <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 16, width: "100%", maxWidth: 450, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1424" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Cancel Invoice {cancelModal.invoiceNumber}</h3>
              <button 
                onClick={() => setCancelModal({ isOpen: false, invoiceId: null, invoiceNumber: "", reason: "" })}
                style={{ background: "#1e293b", border: "none", color: "#64748b", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Reason for Cancellation</label>
              <textarea
                style={{ width: "100%", padding: "10px 14px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 100, resize: "vertical" }}
                placeholder="Enter the reason why this invoice is being cancelled/voided..."
                value={cancelModal.reason}
                onChange={e => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "flex-end", gap: 12, background: "#0d1424" }}>
              <button
                onClick={() => setCancelModal({ isOpen: false, invoiceId: null, invoiceNumber: "", reason: "" })}
                style={{ padding: "8px 16px", background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{ padding: "8px 16px", background: "#ef4444", border: "none", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getDrivePreview = (url) => {
  if (!url || !url.toString().includes("drive.google.com")) return url;
  const match = url.match(/\/d\/(.+?)\//);
  if (match && match[1]) return `https://drive.google.com/uc?id=${match[1]}`;
  const idMatch = url.match(/[?&]id=(.+?)(&|$)/);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?id=${idMatch[1]}`;
  return url;
};

function DocCard({ title, url, isImage }) {
  const hasDoc = !!url;
  const previewUrl = hasDoc ? getDrivePreview(url) : null;
  
  return (
    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#00a6a6", textTransform: "uppercase", letterSpacing: 1 }}>{title}</span>
        <span style={{ 
          fontSize: 10, 
          padding: "2px 8px", 
          borderRadius: 4, 
          fontWeight: 700, 
          background: hasDoc ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", 
          color: hasDoc ? "#10b981" : "#ef4444" 
        }}>
          {hasDoc ? "Uploaded" : "Pending"}
        </span>
      </div>
      
      {hasDoc ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {isImage ? (
            <div style={{ height: 120, background: "#0a0f1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid #1e293b" }}>
              <img 
                src={previewUrl} 
                alt={title} 
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div style={{ display: "none", flexDirection: "column", alignItems: "center", color: "#64748b", fontSize: 12 }}>
                <span>🖼️ Image Preview</span>
              </div>
            </div>
          ) : (
            <div style={{ height: 120, background: "#0a0f1a", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #1e293b", color: "#64748b" }}>
              <span style={{ fontSize: 32 }}>📄</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>PDF / Document File</span>
            </div>
          )}
          
          <a 
            href={url} 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8, 
              background: "linear-gradient(135deg, #002b5b, #004080)", 
              color: "#fff", 
              border: "none", 
              padding: "10px", 
              borderRadius: 8, 
              fontSize: 13, 
              fontWeight: 700, 
              textDecoration: "none", 
              textAlign: "center",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
            onMouseOut={(e) => e.currentTarget.style.opacity = 1}
          >
            👁️ Open in Google Drive ↗
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 172, background: "rgba(239,68,68,0.02)", border: "1px dashed rgba(239,68,68,0.15)", borderRadius: 8, color: "#475569", fontSize: 12, fontStyle: "italic" }}>
          Not uploaded by member yet
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// MEMBER DETAIL MODAL — Full page overlay
// Opens when clicking any member row
// Includes GST invoice generation (Feature 3)
// ══════════════════════════════════════════
function MemberDetailModal({ member: m, onClose, onStatus, onLock, onVerifyPayment, token, showToast }) {
  const [sec, setSec] = useState("profile");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Feature 3: Generate GST Invoice as printable HTML in new tab
  const generateGSTInvoice = async (payment) => {
    if (generatingInvoice) return;
    setGeneratingInvoice(true);
    try {
      await printGSTInvoice(m, payment, showToast, { autoGenerateIfMissing: true });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const TABS = ["profile", "member", "education", "experience", "payment", "uploads"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)", overflowY: "auto" }}
      onClick={onClose}>
      <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 20, width: "100%", maxWidth: 900, marginTop: 20, marginBottom: 20, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #0d1424, #111827)", padding: "28px 32px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #00a6a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {m.firstName?.[0]}{m.lastName?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{m.firstName} {m.lastName}</h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{m.email}</div>
            <code style={{ ...s.idCode, marginTop: 6, display: "inline-block" }}>{m.tempMembershipId}</code>
            <span style={{ ...s.statusBadge, ...SCRUTINY_COLORS[m.scrutinyStatus], marginLeft: 10, verticalAlign: "middle" }}>{m.scrutinyStatus}</span>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", color: "#64748b", width: 36, height: 36, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e293b", padding: "0 32px", background: "#0d1424", gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setSec(t)}
              style={{ background: "none", border: "none", color: sec === t ? "#00a6a6" : "#64748b", padding: "14px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderBottom: `2px solid ${sec === t ? "#00a6a6" : "transparent"}`, textTransform: "capitalize", transition: "all 0.15s" }}>
              {t === "member" ? "Membership" : t === "uploads" ? "Documents" : t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxHeight: "55vh", overflowY: "auto" }}>

          {sec === "profile" && <>
            <InfoCard title="Personal Information">
              <DR label="Title" value={m.personal?.title} />
              <DR label="Gender" value={m.personal?.gender} />
              <DR label="Date of Birth" value={m.personal?.dob} />
              <DR label="Mobile" value={m.personal?.mobile || m.phone} />
              <DR label="Email" value={m.email} />
              <DR label="Father / Husband" value={m.personal?.fatherName} />
            </InfoCard>
            <InfoCard title="Address">
              <DR label="Line 1" value={m.permAddress?.line1} />
              <DR label="Line 2" value={m.permAddress?.line2} />
              <DR label="City" value={m.permAddress?.city} />
              <DR label="District" value={m.permAddress?.district} />
              <DR label="State" value={m.permAddress?.state} />
              <DR label="Pincode" value={m.permAddress?.pincode} />
            </InfoCard>
          </>}

          {sec === "member" && <>
            <InfoCard title="Membership Details">
              <DR label="Membership No." value={m.tempMembershipId} />
              <DR label="Member Class" value={m.memberDetails?.memberClass} />
              <DR label="Asset Class" value={m.memberDetails?.assetClass} />
              <DR label="Valid Till" value={m.memberDetails?.validTill || "—"} />
              <DR label="Scrutiny Status" value={<span style={{ ...s.statusBadge, ...SCRUTINY_COLORS[m.scrutinyStatus] }}>{m.scrutinyStatus}</span>} />
            </InfoCard>
            <InfoCard title="Account Info">
              <DR label="Registered On" value={m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "—"} />
              <DR label="Email Verified" value={m.emailVerified ? "✓ Yes" : "✗ No"} />
              <DR label="Form Locked" value={m.isLocked ? "🔒 Yes" : "🔓 No"} />
            </InfoCard>
          </>}

          {sec === "education" && <>
            <div style={{ gridColumn: "1/-1" }}>
              {m.education?.length > 0 ? (
                <InfoCard title="Educational Qualification">
                  {m.education.map((e, i) => (
                    <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #1e293b" }}>
                      <div style={{ fontWeight: 700, color: "#00a6a6", marginBottom: 6 }}>{e.qualification}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <DR label="Year" value={e.year} /><DR label="% Marks" value={e.marks} />
                        <DR label="Board/Univ" value={e.board} /><DR label="College" value={e.college} />
                      </div>
                      {e.fileName && (
                        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                          <a href={e.fileName} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,166,166,0.1)", border: "1px solid rgba(0,166,166,0.25)", color: "#00a6a6", padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", fontWeight: 700 }}>
                            👁️ View Certificate ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </InfoCard>
              ) : <Empty text="No education records" />}
              {m.professionalQualification?.length > 0 && (
                <InfoCard title="Professional Qualification" style={{ marginTop: 16 }}>
                  {m.professionalQualification.map((p, i) => (
                    <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #1e293b" }}>
                      <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>{p.qualification}</div>
                      <DR label="Institute" value={p.institute} />
                      <DR label="Membership No" value={p.membershipNo} />
                      <DR label="Year" value={p.year} />
                      <DR label="Validity" value={p.validity} />
                      {p.fileName && (
                        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                          <a href={p.fileName} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,166,166,0.1)", border: "1px solid rgba(0,166,166,0.25)", color: "#00a6a6", padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", fontWeight: 700 }}>
                            👁️ View Certificate ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </InfoCard>
              )}
            </div>
          </>}

          {sec === "experience" && (
            <div style={{ gridColumn: "1/-1" }}>
              {m.experience?.filter(e => e.employer).length > 0 ? (
                <InfoCard title="Work Experience">
                  {m.experience.filter(e => e.employer).map((e, i) => (
                    <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #1e293b" }}>
                      <div style={{ fontWeight: 700, color: "#00a6a6", marginBottom: 6 }}>{e.employer}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <DR label="Designation" value={e.designation} /><DR label="Status" value={e.status} />
                        <DR label="From" value={e.from} /><DR label="To" value={e.to} />
                        <DR label="Area" value={e.area} /><DR label="Years" value={e.years} />
                      </div>
                      {e.fileName && (
                        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                          <a href={e.fileName} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,166,166,0.1)", border: "1px solid rgba(0,166,166,0.25)", color: "#00a6a6", padding: "6px 12px", borderRadius: 8, fontSize: 12, textDecoration: "none", fontWeight: 700 }}>
                            👁️ View Experience Document ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </InfoCard>
              ) : <Empty text="No experience records" />}
            </div>
          )}

          {sec === "payment" && (
            <div style={{ gridColumn: "1/-1" }}>
              {m.payments?.length > 0 ? m.payments.map((p, i) => (
                <InfoCard key={i} title={`Payment #${i + 1}`} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#00a6a6" }}>₹{parseFloat(p.amount).toLocaleString("en-IN")}</span>
                    <span style={{ ...s.statusBadge, background: p.status === "Completed" ? "#d1fae5" : "#fee2e2", color: p.status === "Completed" ? "#065f46" : "#991b1b" }}>{p.status}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <DR label="Order ID" value={p.orderId} />
                    <DR label="Tracking ID" value={p.trackingId} />
                    <DR label="Bank Ref No" value={p.bankRefNo} />
                    <DR label="Payment Mode" value={p.paymentMode} />
                    <DR label="Paid At" value={p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "—"} />
                    <DR label="Valid Till" value={p.validTill ? new Date(p.validTill).toLocaleDateString("en-IN") : "—"} />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    {p.status !== "Completed" && (
                      <button onClick={() => onVerifyPayment(m._id, p.orderId)}
                        style={{ flex: 1, background: "rgba(0,166,166,0.1)", border: "1px solid rgba(0,166,166,0.3)", color: "#00a6a6", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        ✓ Verify Payment
                      </button>
                    )}
                    {/* Feature 3: GST Invoice button — only for completed payments */}
                    {p.status === "Completed" && (
                      <button
                        onClick={() => generateGSTInvoice(p)}
                        disabled={generatingInvoice}
                        style={{ flex: 1, background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        🧾 Generate GST Invoice
                      </button>
                    )}
                  </div>
                </InfoCard>
              )) : <Empty text="No payment records" />}
            </div>
          )}

          {sec === "uploads" && (
            <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ gridColumn: "1/-1", fontSize: 13, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #1e293b", paddingBottom: 10, marginBottom: 10 }}>
                📂 CORE MEMBER DOCUMENTS (GOOGLE DRIVE STORAGE)
              </div>
              <DocCard title="Profile Picture" url={m.uploadedDocs?.picture} isImage={true} />
              <DocCard title="Signature" url={m.uploadedDocs?.signature} isImage={true} />
              <DocCard title="PAN Card" url={m.uploadedDocs?.pan} isImage={false} />
              <DocCard title="Aadhaar Card" url={m.uploadedDocs?.aadhar} isImage={false} />
              <DocCard title="DL / Passport / Voter ID" url={m.uploadedDocs?.dlPassportVoter} isImage={false} />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid #1e293b", background: "#0d1424", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Scrutiny Actions</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Accepted", "Hold", "Rejected", "Pending"].map(status => (
                <button key={status}
                  style={{ ...s.actionBtn, opacity: m.scrutinyStatus === status ? 0.4 : 1, background: m.scrutinyStatus === status ? "#1e293b" : "#111827" }}
                  disabled={m.scrutinyStatus === status}
                  onClick={() => onStatus(m._id, status)}>{status}</button>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Form Control</div>
              <button
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: m.isLocked ? "#fee2e2" : "#d1fae5", color: m.isLocked ? "#991b1b" : "#065f46", minWidth: 140 }}
                onClick={() => onLock(m._id, !m.isLocked)}>
                {m.isLocked ? "🔒 Unlock Form" : "🔓 Lock Form"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: generate and open GST invoice in a new tab
async function printGSTInvoice(m, payment, showToast, options = {}) {
  try {
    const { autoGenerateIfMissing = false } = options;
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    if (!token) {
      if (showToast) showToast("Authentication token not found.", "error");
      else alert("Authentication token not found.");
      return;
    }

    // Open tab immediately in click flow to avoid popup blockers after async boundaries.
    const win = window.open("", "_blank");
    if (!win) {
      if (showToast) showToast("Popup was blocked. Please allow popups for this site.", "error");
      else alert("Popup was blocked. Please allow popups for this site.");
      return;
    }

    win.document.write("<!doctype html><html><head><title>Preparing invoice...</title></head><body style='font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#334155;'>Preparing GST invoice...</body></html>");
    win.document.close();

    const fetchInvoiceByOrder = async () => {
      const res = await fetch(`/api/gst/invoices?orderId=${payment.orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    };

    let result = await fetchInvoiceByOrder();
    if ((!result.success || !result.data || result.data.length === 0) && autoGenerateIfMissing) {
      const userId = m?._id || payment?.user || payment?.userId;
      if (userId && payment?.orderId) {
        const genRes = await fetch("/api/gst/invoices/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userId, orderId: payment.orderId })
        });
        const genData = await genRes.json();
        if (!genRes.ok || !genData.success) {
          throw new Error(genData.message || "Failed to auto-generate invoice.");
        }
        result = await fetchInvoiceByOrder();
      }
    }

    if (!result.success || !result.data || result.data.length === 0) {
      win.close();
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

// ── InfoCard helper for the modal ──
function GSTConfigPanel({ token, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState("company"); // company, tax, hsn
  const [loading, setLoading] = useState(false);

  // --- Company Profile States ---
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    companyName: "", companyAddress: "", email: "", phone: "",
    gstNumber: "", state: "", stateCode: "", pan: "",
    bankName: "", accountNumber: "", ifscCode: "", branchName: "",
    signatoryName: "", signatoryDesignation: "", signatureUrl: "",
    isActive: true, isDefault: false
  });

  // --- Tax Config States ---
  const [taxes, setTaxes] = useState([]);
  const [editingTax, setEditingTax] = useState(null);
  const [taxForm, setTaxForm] = useState({
    name: "", gstPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18, description: "", isActive: true
  });

  // --- HSN/SAC States ---
  const [hsnCodes, setHsnCodes] = useState([]);
  const [editingHsn, setEditingHsn] = useState(null);
  const [hsnForm, setHsnForm] = useState({
    code: "", type: "Services", taxRate: "", description: "", isActive: true
  });

  // Load Data
  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/gst/profile", { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) setProfiles(d.data);
    } catch (e) { showToast(e.message, "error"); }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/gst/tax", { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) setTaxes(d.data);
    } catch (e) { showToast(e.message, "error"); }
  };

  const fetchHSN = async () => {
    try {
      const res = await fetch("/api/gst/hsn", { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (d.success) setHsnCodes(d.data);
    } catch (e) { showToast(e.message, "error"); }
  };

  useEffect(() => {
    fetchProfiles();
    fetchTaxes();
    fetchHSN();
  }, [token]);

  // --- Submit Handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingProfile ? `/api/gst/profile/${editingProfile}` : "/api/gst/profile";
      const method = editingProfile ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to save profile");
      showToast(editingProfile ? "Company GST Profile updated!" : "Company GST Profile created!");
      setEditingProfile(null);
      setProfileForm({
        companyName: "", companyAddress: "", email: "", phone: "",
        gstNumber: "", state: "", stateCode: "", pan: "",
        bankName: "", accountNumber: "", ifscCode: "", branchName: "",
        signatoryName: "", signatoryDesignation: "", signatureUrl: "",
        isActive: true, isDefault: false
      });
      fetchProfiles();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingTax ? `/api/gst/tax/${editingTax}` : "/api/gst/tax";
      const method = editingTax ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(taxForm)
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to save tax");
      showToast(editingTax ? "Tax rate updated!" : "Tax rate registered!");
      setEditingTax(null);
      setTaxForm({ name: "", gstPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18, description: "", isActive: true });
      fetchTaxes();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHsnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingHsn ? `/api/gst/hsn/${editingHsn}` : "/api/gst/hsn";
      const method = editingHsn ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(hsnForm)
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to save HSN/SAC code");
      showToast(editingHsn ? "HSN/SAC updated!" : "HSN/SAC registered!");
      setEditingHsn(null);
      setHsnForm({ code: "", type: "Services", taxRate: "", description: "", isActive: true });
      fetchHSN();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Deletion Handlers ---
  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;
    try {
      const res = await fetch(`/api/gst/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Deletion failed.");
      showToast("Record deleted successfully.");
      if (type === "profile") fetchProfiles();
      if (type === "tax") fetchTaxes();
      if (type === "hsn") fetchHSN();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  // Helpers for UI
  const subTabStyles = (tab) => ({
    padding: "8px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    background: activeSubTab === tab ? "rgba(0,166,166,0.15)" : "transparent",
    color: activeSubTab === tab ? "#00a6a6" : "#94a3b8",
    border: `1px solid ${activeSubTab === tab ? "#00a6a6" : "rgba(148,163,184,0.15)"}`,
    transition: "all 0.2s"
  });

  const formSectionStyle = {
    background: "#0d1424",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 16
  };

  const inputStyle = {
    width: "100%",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none"
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 6
  };

  const submitBtnStyle = {
    background: "#00a6a6",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    opacity: loading ? 0.7 : 1
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Sub-tabs header */}
      <div style={{ display: "flex", gap: 10, background: "#111827", padding: 8, borderRadius: 10, border: "1px solid #1e293b", alignSelf: "flex-start" }}>
        <button style={subTabStyles("company")} onClick={() => setActiveSubTab("company")}>Company GST Profiles</button>
        <button style={subTabStyles("tax")} onClick={() => setActiveSubTab("tax")}>GST Tax Rates</button>
        <button style={subTabStyles("hsn")} onClick={() => setActiveSubTab("hsn")}>HSN / SAC Codes</button>
      </div>

      {/* --- COMPANY GST PROFILES --- */}
      {activeSubTab === "company" && (
        <div>
          <div style={formSectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{editingProfile ? "Edit Company GST Profile" : "Create Company GST Profile"}</h3>
            <form onSubmit={handleProfileSubmit}>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input style={inputStyle} value={profileForm.companyName} onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>GSTIN (GST Number) *</label>
                  <input style={inputStyle} placeholder="27AAAAA1111A1Z1" value={profileForm.gstNumber} onChange={e => {
                    const val = e.target.value.toUpperCase();
                    let sCode = profileForm.stateCode;
                    if (val.length >= 2) sCode = val.slice(0, 2);
                    setProfileForm({ ...profileForm, gstNumber: val, stateCode: sCode });
                  }} required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" style={inputStyle} value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input style={inputStyle} value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} required />
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input style={inputStyle} placeholder="e.g. Maharashtra" value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>State Code *</label>
                  <input style={{ ...inputStyle, background: "rgba(30,41,59,0.5)", cursor: "not-allowed" }} value={profileForm.stateCode} readOnly required />
                </div>
                <div>
                  <label style={labelStyle}>PAN</label>
                  <input style={inputStyle} value={profileForm.pan} onChange={e => setProfileForm({ ...profileForm, pan: e.target.value })} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#94a3b8" }}>
                    <input type="checkbox" checked={profileForm.isDefault} onChange={e => setProfileForm({ ...profileForm, isDefault: e.target.checked })} style={{ accentColor: "#00a6a6" }} /> Set Default
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#94a3b8" }}>
                    <input type="checkbox" checked={profileForm.isActive} onChange={e => setProfileForm({ ...profileForm, isActive: e.target.checked })} style={{ accentColor: "#00a6a6" }} /> Active
                  </label>
                </div>
              </div>

              <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
                <div>
                  <label style={labelStyle}>Corporate Address *</label>
                  <textarea style={{ ...inputStyle, minHeight: 60 }} value={profileForm.companyAddress} onChange={e => setProfileForm({ ...profileForm, companyAddress: e.target.value })} required />
                </div>
              </div>

              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6", textTransform: "uppercase", margin: "16px 0 10px" }}>Bank details (For Invoice generation)</h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Bank Name</label>
                  <input style={inputStyle} value={profileForm.bankName} onChange={e => setProfileForm({ ...profileForm, bankName: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Account Number</label>
                  <input style={inputStyle} value={profileForm.accountNumber} onChange={e => setProfileForm({ ...profileForm, accountNumber: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>IFSC Code</label>
                  <input style={inputStyle} value={profileForm.ifscCode} onChange={e => setProfileForm({ ...profileForm, ifscCode: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Branch Name</label>
                  <input style={inputStyle} value={profileForm.branchName} onChange={e => setProfileForm({ ...profileForm, branchName: e.target.value })} />
                </div>
              </div>

              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6", textTransform: "uppercase", margin: "16px 0 10px" }}>Authorized signatory</h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Signatory Name</label>
                  <input style={inputStyle} value={profileForm.signatoryName} onChange={e => setProfileForm({ ...profileForm, signatoryName: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Signatory Designation</label>
                  <input style={inputStyle} value={profileForm.signatoryDesignation} onChange={e => setProfileForm({ ...profileForm, signatoryDesignation: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Signature URL / Text</label>
                  <input style={inputStyle} placeholder="Verification Text or signature image link" value={profileForm.signatureUrl} onChange={e => setProfileForm({ ...profileForm, signatureUrl: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={submitBtnStyle} disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
                {editingProfile && (
                  <button type="button" style={{ ...submitBtnStyle, background: "none", border: "1px solid #ef4444", color: "#ef4444" }} onClick={() => {
                    setEditingProfile(null);
                    setProfileForm({
                      companyName: "", companyAddress: "", email: "", phone: "",
                      gstNumber: "", state: "", stateCode: "", pan: "",
                      bankName: "", accountNumber: "", ifscCode: "", branchName: "",
                      signatoryName: "", signatoryDesignation: "", signatureUrl: "",
                      isActive: true, isDefault: false
                    });
                  }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 12, padding: 24, overflowX: "auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Configured Company GST Profiles</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1e293b" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Company Name</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>GSTIN</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>State</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>State Code</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Status</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Default</th>
                  <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 20, color: "#64748b", fontStyle: "italic", fontSize: 13 }}>No GST profiles configured yet.</td>
                  </tr>
                ) : profiles.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}><strong>{p.companyName}</strong></td>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}><code>{p.gstNumber}</code></td>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}>{p.state}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}>{p.stateCode}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: p.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: p.isActive ? "#10b981" : "#ef4444" }}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: p.isDefault ? "rgba(0,166,166,0.1)" : "transparent", color: p.isDefault ? "#00a6a6" : "#64748b" }}>{p.isDefault ? "Default" : "—"}</span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <button style={{ background: "none", border: "none", color: "#00a6a6", marginRight: 12, cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => {
                        setEditingProfile(p._id);
                        setProfileForm({
                          companyName: p.companyName, companyAddress: p.companyAddress, email: p.email, phone: p.phone,
                          gstNumber: p.gstNumber, state: p.state, stateCode: p.stateCode, pan: p.pan || "",
                          bankName: p.bankDetails?.bankName || "", accountNumber: p.bankDetails?.accountNumber || "",
                          ifscCode: p.bankDetails?.ifscCode || "", branchName: p.bankDetails?.branchName || "",
                          signatoryName: p.authorizedSignatory?.name || "", signatoryDesignation: p.authorizedSignatory?.designation || "",
                          signatureUrl: p.authorizedSignatory?.signatureUrl || "", isActive: p.isActive, isDefault: p.isDefault
                        });
                      }}>Edit</button>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => handleDelete("profile", p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- GST TAX RATES --- */}
      {activeSubTab === "tax" && (
        <div>
          <div style={formSectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{editingTax ? "Edit Tax Configuration" : "Add Tax Rate"}</h3>
            <form onSubmit={handleTaxSubmit}>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Tax Name *</label>
                  <input style={inputStyle} placeholder="e.g. GST 18%" value={taxForm.name} onChange={e => setTaxForm({ ...taxForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Total GST Percentage *</label>
                  <input type="number" style={inputStyle} value={taxForm.gstPercentage} onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setTaxForm({
                      ...taxForm,
                      gstPercentage: val,
                      cgstPercentage: val / 2,
                      sgstPercentage: val / 2,
                      igstPercentage: val
                    });
                  }} required />
                </div>
                <div>
                  <label style={labelStyle}>CGST Percentage</label>
                  <input type="number" style={inputStyle} value={taxForm.cgstPercentage} onChange={e => setTaxForm({ ...taxForm, cgstPercentage: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label style={labelStyle}>SGST Percentage</label>
                  <input type="number" style={inputStyle} value={taxForm.sgstPercentage} onChange={e => setTaxForm({ ...taxForm, sgstPercentage: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label style={labelStyle}>IGST Percentage</label>
                  <input type="number" style={inputStyle} value={taxForm.igstPercentage} onChange={e => setTaxForm({ ...taxForm, igstPercentage: parseFloat(e.target.value) || 0 })} required />
                </div>
              </div>

              <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
                <div>
                  <label style={labelStyle}>Tax Description</label>
                  <input style={inputStyle} placeholder="e.g. Standard tax rate for services" value={taxForm.description} onChange={e => setTaxForm({ ...taxForm, description: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={submitBtnStyle} disabled={loading}>{loading ? "Saving..." : "Save Tax Configuration"}</button>
                {editingTax && (
                  <button type="button" style={{ ...submitBtnStyle, background: "none", border: "1px solid #ef4444", color: "#ef4444" }} onClick={() => {
                    setEditingTax(null);
                    setTaxForm({ name: "", gstPercentage: 18, cgstPercentage: 9, sgstPercentage: 9, igstPercentage: 18, description: "", isActive: true });
                  }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 12, padding: 24, overflowX: "auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Tax Master Configurations</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1e293b" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Tax Name</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Total GST %</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>CGST %</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>SGST %</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>IGST %</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taxes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 20, color: "#64748b", fontStyle: "italic", fontSize: 13 }}>No tax percentages configured yet.</td>
                  </tr>
                ) : taxes.map(t => (
                  <tr key={t._id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}><strong>{t.name}</strong></td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{t.gstPercentage}%</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{t.cgstPercentage}%</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{t.sgstPercentage}%</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{t.igstPercentage}%</td>
                    <td style={{ padding: "12px 8px", fontSize: 13, color: "#94a3b8" }}>{t.description || "—"}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <button style={{ background: "none", border: "none", color: "#00a6a6", marginRight: 12, cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => {
                        setEditingTax(t._id);
                        setTaxForm({
                          name: t.name, gstPercentage: t.gstPercentage, cgstPercentage: t.cgstPercentage,
                          sgstPercentage: t.sgstPercentage, igstPercentage: t.igstPercentage, description: t.description || "", isActive: t.isActive
                        });
                      }}>Edit</button>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => handleDelete("tax", t._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- HSN / SAC CODES --- */}
      {activeSubTab === "hsn" && (
        <div>
          <div style={formSectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{editingHsn ? "Edit HSN/SAC Mapping" : "Register HSN/SAC Code"}</h3>
            <form onSubmit={handleHsnSubmit}>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>HSN/SAC Code *</label>
                  <input style={inputStyle} placeholder="e.g. 9983 or 999591" value={hsnForm.code} onChange={e => setHsnForm({ ...hsnForm, code: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select style={inputStyle} value={hsnForm.type} onChange={e => setHsnForm({ ...hsnForm, type: e.target.value })} required>
                    <option>Services</option>
                    <option>Goods</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tax Rate Association *</label>
                  <select style={inputStyle} value={hsnForm.taxRate} onChange={e => setHsnForm({ ...hsnForm, taxRate: e.target.value })} required>
                    <option value="">Select Associated Tax Rate</option>
                    {taxes.map(t => <option key={t._id} value={t._id}>{t.name} ({t.gstPercentage}%)</option>)}
                  </select>
                </div>
              </div>

              <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
                <div>
                  <label style={labelStyle}>Description / SAC Category</label>
                  <input style={inputStyle} placeholder="e.g. Professional Association Membership Fees" value={hsnForm.description} onChange={e => setHsnForm({ ...hsnForm, description: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={submitBtnStyle} disabled={loading}>{loading ? "Saving..." : "Save Mapping"}</button>
                {editingHsn && (
                  <button type="button" style={{ ...submitBtnStyle, background: "none", border: "1px solid #ef4444", color: "#ef4444" }} onClick={() => {
                    setEditingHsn(null);
                    setHsnForm({ code: "", type: "Services", taxRate: "", description: "", isActive: true });
                  }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 12, padding: 24, overflowX: "auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Registered HSN/SAC Codes</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1e293b" }}>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>HSN/SAC Code</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Type</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Associated Tax Name</th>
                  <th style={{ textAlign: "center", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Tax Percentage</th>
                  <th style={{ textAlign: "left", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Description</th>
                  <th style={{ textAlign: "right", padding: "12px 8px", fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hsnCodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 20, color: "#64748b", fontStyle: "italic", fontSize: 13 }}>No HSN/SAC codes mapped yet.</td>
                  </tr>
                ) : hsnCodes.map(h => (
                  <tr key={h._id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "12px 8px", fontSize: 13 }}><strong><code>{h.code}</code></strong></td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{h.type}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{h.taxRate?.name || "—"}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 13 }}>{h.taxRate ? `${h.taxRate.gstPercentage}%` : "—"}</td>
                    <td style={{ padding: "12px 8px", fontSize: 13, color: "#94a3b8" }}>{h.description || "—"}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <button style={{ background: "none", border: "none", color: "#00a6a6", marginRight: 12, cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => {
                        setEditingHsn(h._id);
                        setHsnForm({
                          code: h.code, type: h.type, taxRate: h.taxRate?._id || "", description: h.description || "", isActive: h.isActive
                        });
                      }}>Edit</button>
                      <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={() => handleDelete("hsn", h._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children, style }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 18, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#00a6a6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════
// CMS PANEL — FIXED bracket structure
// ══════════════════════════════════════════
function CMSPanel({ cms, token, onUpdate, showToast }) {
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [form, setForm] = useState({ key: "", value: "", type: "text" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const cmsMap = {};
  cms.forEach(item => { cmsMap[item.key] = item.value; });

  const getLiveValue = (field) => {
    const saved = cmsMap[field.key];
    if (saved && saved !== "__deleted__") return { value: saved, source: "saved" };
    return { value: field.defaultValue, source: "default" };
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setSelectedField(null);
    setForm({ key: "", value: "", type: "text" });
  };

  const handleSelectField = (field) => {
    setSelectedField(field);
    const live = getLiveValue(field);
    setForm({ key: field.key, value: live.value, type: field.type });
  };

  const handleSave = async () => {
    if (!form.key || !form.value) { showToast("Please enter a value", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { onUpdate(); showToast("Published! Changes are live on the website."); }
      else showToast("Failed to publish", "error");
    } catch { showToast("Failed to publish", "error"); }
    setSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(prev => ({ ...prev, value: data.url }));
        showToast("File uploaded! Click Publish to save.");
      } else showToast(data.message || "Upload failed", "error");
    } catch { showToast("Upload failed", "error"); }
    setUploading(false);
    e.target.value = "";
  };

  const currentLive = selectedField ? getLiveValue(selectedField) : null;
  const isImage = form.type === "image";
  const isImageUrl = (v) => v && /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(v);
  const isPDF = (v) => v && /\.pdf$/i.test(v);
  const hasChanged = selectedField && form.value !== (currentLive?.value || "");

  const renderPreview = (value, fieldKey) => {
    if (!value) return <span style={{ color: "#475569", fontSize: 13, fontStyle: "italic" }}>Nothing set yet</span>;
    if (isImageUrl(value)) return (
      <div>
        <img src={value} alt="preview" style={{ maxWidth: "100%", maxHeight: 130, objectFit: "contain", borderRadius: 8 }} onError={e => { e.target.style.display = "none"; }} />
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4, wordBreak: "break-all" }}>{value}</div>
      </div>
    );
    if (isPDF(value)) return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "#1a1a2e", borderRadius: 8 }}>
        <span style={{ fontSize: 24 }}>📄</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>PDF Document</div>
          <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#60a5fa" }}>Open PDF ↗</a>
        </div>
      </div>
    );
    if (fieldKey?.includes("title") || fieldKey?.includes("heading")) return <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{value}</div>;
    if (fieldKey?.includes("badge")) return <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6", textTransform: "uppercase", letterSpacing: 2 }}>{value}</div>;
    if (fieldKey?.startsWith("stats_")) return <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>{value}</div>;
    if (fieldKey?.startsWith("contact_") || fieldKey?.startsWith("footer_") || fieldKey?.startsWith("social_") || fieldKey?.startsWith("bank_") || fieldKey?.startsWith("legal_")) return <div style={{ fontSize: 14, fontWeight: 600, color: "#00a6a6" }}>{value}</div>;
    if (fieldKey?.includes("btn") || fieldKey?.includes("label") || fieldKey?.includes("ph")) return <div style={{ display: "inline-block", background: "#002b5b", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{value}</div>;
    return <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7 }}>{value}</div>;
  };

  // ── User Dashboard page: show UserDashboardEditor across all 3 cols ──
  if (selectedPage?.page === "User Dashboard") {
    return (
      <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Select Page</div>
          <PageList pages={ALL_PAGES} selectedPage={selectedPage} onSelect={handleSelectPage} cmsMap={cmsMap} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UserDashboardEditor token={token} showToast={showToast} cms={cms} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }

  // ── Board of Directors page: show BOD card manager + standard field editor ──
  if (selectedPage?.page === "Board of Directors") {
    return (
      <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Select Page</div>
          <PageList pages={ALL_PAGES} selectedPage={selectedPage} onSelect={handleSelectPage} cmsMap={cmsMap} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Hero text fields (normal CMS fields) */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              {selectedPage.fields.map(field => {
                const isActive = selectedField?.key === field.key;
                const live = getLiveValue(field);
                const isSaved = live.source === "saved";
                return (
                  <button key={field.key} style={{ ...s.fieldBtn, ...(isActive ? s.fieldBtnActive : {}), marginBottom: 6, width: "100%" }}
                    onClick={() => handleSelectField(field)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#00a6a6" : "#e2e8f0" }}>{field.label}</span>
                      <span style={{ ...s.typePill, background: "#1a3a2a", color: "#34d399" }}>TXT</span>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isSaved ? "#00a6a6" : "#64748b" }}>
                      {isSaved ? "✓ " : "● "}{live.value?.slice(0, 32)}…
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* BOD Cards Manager */}
          <BODCardsManager token={token} showToast={showToast} cms={cms} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }

  // ── Committee page: show CommitteeManager spanning col2+col3 ──
  if (selectedPage?.page === "Committee") {
    return (
      <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Select Page</div>
          <PageList pages={ALL_PAGES} selectedPage={selectedPage} onSelect={handleSelectPage} cmsMap={cmsMap} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CommitteeManager token={token} showToast={showToast} cms={cms} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }

  if (selectedPage?.page === "Events") {
    return (
      <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>
        <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Select Page</div>
          <PageList pages={ALL_PAGES} selectedPage={selectedPage} onSelect={handleSelectPage} cmsMap={cmsMap} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <EventManager token={token} showToast={showToast} cms={cms} onUpdate={onUpdate} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 0, minHeight: "70vh" }}>

      {/* COL 1 — Page List */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Select Page</div>
        <PageList pages={ALL_PAGES} selectedPage={selectedPage} onSelect={handleSelectPage} cmsMap={cmsMap} />
      </div>

      {/* COL 2 — Field List */}
      <div style={{ width: 270, flexShrink: 0, borderRight: "1px solid #1e293b", paddingRight: 16, marginRight: 16 }}>
        {!selectedPage ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569", fontSize: 14 }}>← Select a page</div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              {selectedPage.icon} {selectedPage.page}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: "68vh", overflowY: "auto" }}>
              {selectedPage.fields.map(field => {
                const isActive = selectedField?.key === field.key;
                const live = getLiveValue(field);
                const isSaved = live.source === "saved";
                return (
                  <button key={field.key}
                    style={{ ...s.fieldBtn, ...(isActive ? s.fieldBtnActive : {}) }}
                    onClick={() => handleSelectField(field)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#00a6a6" : "#e2e8f0", textAlign: "left" }}>{field.label}</span>
                      <span style={{ ...s.typePill, background: field.type === "image" ? "#1e3a5f" : "#1a3a2a", color: field.type === "image" ? "#60a5fa" : "#34d399", flexShrink: 0 }}>
                        {field.type === "image" ? "IMG" : "TXT"}
                      </span>
                    </div>
                    {live.value ? (
                      <div style={{ fontSize: 11, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isSaved ? "#00a6a6" : "#64748b" }}>
                        {isSaved ? "✓ " : "● "}{live.value.length > 32 ? live.value.slice(0, 32) + "…" : live.value}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#374151", marginTop: 3 }}>
                        {field.type === "image" ? "No image set yet" : "No text set yet"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* COL 3 — Editor + Preview */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {!selectedField ? (
          <div style={{ ...s.card, textAlign: "center", padding: "60px 20px", color: "#475569", fontSize: 14 }}>
            {!selectedPage ? "Select a page and a field to start editing" : "← Select a field to edit it"}
          </div>
        ) : (
          <>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardTitle}>{selectedField.label}</div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{selectedField.desc}</div>
                </div>
                <span style={{ ...s.typePill, background: isImage ? "#1e3a5f" : "#1a3a2a", color: isImage ? "#60a5fa" : "#34d399" }}>{form.type}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={s.fieldLabel}>{isImage ? "Image / PDF URL or Upload" : "New Content Value"}</label>
                  {!isImage ? (
                    <textarea style={{ ...s.fieldInput, minHeight: selectedField.key?.includes("desc") || selectedField.key?.includes("text") || selectedField.key?.includes("para") ? 110 : 56, resize: "vertical" }}
                      value={form.value} placeholder={`Current: "${currentLive?.value || "not set"}"`}
                      onChange={e => setForm({ ...form, value: e.target.value })} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <input style={s.fieldInput} value={form.value} placeholder="Paste image/PDF URL here..." onChange={e => setForm({ ...form, value: e.target.value })} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
                        <span style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
                      </div>
                      <button style={{ ...s.uploadFileBtn, opacity: uploading ? 0.7 : 1 }} onClick={() => fileRef.current?.click()} disabled={uploading}>
                        {uploading ? "⏳ Uploading..." : "📁 Upload from your device (image or PDF)"}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFileUpload} />
                      {form.value?.startsWith("/uploads/") && (
                        <div style={{ fontSize: 12, color: "#00a6a6", padding: "8px 12px", background: "rgba(0,166,166,0.08)", borderRadius: 8 }}>✓ Uploaded: {form.value}</div>
                      )}
                    </div>
                  )}
                </div>
                <button style={{ ...s.publishBtn, opacity: (saving || !hasChanged || !form.value) ? 0.5 : 1, background: (hasChanged && form.value) ? "linear-gradient(135deg, #002b5b, #004080)" : "#1e293b" }}
                  onClick={handleSave} disabled={saving || !hasChanged || !form.value}>
                  {saving ? "Publishing..." : (hasChanged && form.value) ? "⚡ Publish Changes" : "✓ No Changes"}
                </button>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Live Preview</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>What users see on the website right now</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={s.previewBox}>
                  <div style={s.previewLabel}>
                    <span style={{ ...s.previewDot, background: currentLive?.source === "saved" ? "#00a6a6" : "#f59e0b" }} />
                    <div>
                      <span style={{ fontWeight: 800 }}>Current (Live Now)</span>
                      <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 700, background: currentLive?.source === "saved" ? "rgba(0,166,166,0.15)" : "rgba(245,158,11,0.15)", color: currentLive?.source === "saved" ? "#00a6a6" : "#f59e0b" }}>
                        {currentLive?.source === "saved" ? "Customised" : "Website default"}
                      </span>
                    </div>
                  </div>
                  <div style={s.previewContent}>{renderPreview(currentLive?.value, selectedField?.key)}</div>
                </div>
                <div style={{ ...s.previewBox, borderColor: hasChanged && form.value ? "rgba(0,166,166,0.4)" : "#1e293b" }}>
                  <div style={s.previewLabel}>
                    <span style={{ ...s.previewDot, background: hasChanged && form.value ? "#00a6a6" : "#475569" }} />
                    <span style={{ fontWeight: 800 }}>{hasChanged && form.value ? "After Publish" : "No Change Yet"}</span>
                  </div>
                  <div style={s.previewContent}>
                    {form.value ? renderPreview(form.value, selectedField?.key) : <span style={{ color: "#475569", fontSize: 13, fontStyle: "italic" }}>Type above to see a preview</span>}
                  </div>
                  {hasChanged && form.value && <div style={{ marginTop: 8, padding: "5px 10px", background: "rgba(0,166,166,0.1)", borderRadius: 6, fontSize: 11, color: "#00a6a6", fontWeight: 700 }}>⚡ Ready to publish</div>}
                </div>
              </div>
              {hasChanged && form.value && (
                <div style={{ textAlign: "center", fontSize: 12, color: "#00a6a6", fontWeight: 700, paddingTop: 12 }}>
                  This will replace the current website content instantly for all visitors
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Extracted page list to avoid duplication
// ══════════════════════════════════════════
// COMMITTEE MANAGER
// Admin can add/edit/remove/reorder committees and their members
// Stored in CMS as JSON under key "committee_data"
// ══════════════════════════════════════════
const EMOJI_OPTIONS = ["👥", "⚖️", "🏛", "📋", "🎓", "💼", "🔍", "🤝", "📊", "🌐", "💡", "🛡", "📣", "🏆", "🔬"];

const DEFAULT_COMMITTEES = [
  {
    id: "com_1", icon: "👥", title: "Membership Committee",
    members: [
      { id: "m1", name: "Elakkiya D", role: "Member" },
      { id: "m2", name: "Gurbinder Singh", role: "Member" },
      { id: "m3", name: "Simul Sarkar", role: "Member" },
      { id: "m4", name: "Sudhir Kumar Singh", role: "Member" },
    ],
  },
  {
    id: "com_2", icon: "⚖️", title: "Disciplinary Committee",
    members: [
      { id: "m5", name: "Babu G", role: "Member" },
      { id: "m6", name: "Siddant Arora", role: "Member" },
      { id: "m7", name: "Chaitanya K Srivastava", role: "Member" },
      { id: "m8", name: "Bhimrao Jaligama", role: "Member" },
    ],
  },
];

function CommitteeManager({ token, showToast, cms, onUpdate }) {
  const [committees, setCommittees] = useState(null);
  const [saving, setSaving] = useState(false);
  // Which committee is expanded
  const [expandedId, setExpandedId] = useState(null);
  // Add committee form
  const [showAddCommittee, setShowAddCommittee] = useState(false);
  const [newCommittee, setNewCommittee] = useState({ title: "", icon: "👥" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Add member form: { committeeId, name, role }
  const [addMemberFor, setAddMemberFor] = useState(null);
  const [newMember, setNewMember] = useState({ name: "", role: "Member" });
  // Edit member
  const [editMember, setEditMember] = useState(null); // { committeeId, member }
  const [editMemberForm, setEditMemberForm] = useState({ name: "", role: "" });

  useEffect(() => {
    const cmsMap = {};
    cms.forEach(item => { if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value; });
    const raw = cmsMap["committee_data"];
    if (raw) {
      try { setCommittees(JSON.parse(raw)); } catch { setCommittees([...DEFAULT_COMMITTEES]); }
    } else {
      setCommittees([...DEFAULT_COMMITTEES]);
    }
  }, [cms]);

  const persist = async (updated) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "committee_data", value: JSON.stringify(updated), type: "text" }),
      });
      if (res.ok) {
        showToast("Committee updated! Changes are live on the website.");
        if (onUpdate) onUpdate();
      }
      else showToast("Failed to save", "error");
    } catch { showToast("Failed to save", "error"); }
    setSaving(false);
  };

  const update = (newData) => { setCommittees(newData); persist(newData); };

  const addCommittee = () => {
    if (!newCommittee.title.trim()) return;
    const added = [...committees, { id: `com_${Date.now()}`, icon: newCommittee.icon, title: newCommittee.title.trim(), members: [] }];
    update(added);
    setNewCommittee({ title: "", icon: "👥" });
    setShowAddCommittee(false);
    setExpandedId(added[added.length - 1].id);
    showToast("New committee section added!");
  };

  const removeCommittee = (id) => {
    if (!window.confirm("Remove this entire committee section?")) return;
    update(committees.filter(c => c.id !== id));
  };

  const updateCommitteeIcon = (id, icon) => {
    update(committees.map(c => c.id === id ? { ...c, icon } : c));
  };

  const addMember = (committeeId) => {
    if (!newMember.name.trim()) return;
    const memberId = `m_${Date.now()}`;
    update(committees.map(c =>
      c.id === committeeId
        ? { ...c, members: [...c.members, { id: memberId, name: newMember.name.trim(), role: newMember.role || "Member" }] }
        : c
    ));
    setNewMember({ name: "", role: "Member" });
    setAddMemberFor(null);
    showToast("Member added!");
  };

  const removeMember = (committeeId, memberId) => {
    update(committees.map(c =>
      c.id === committeeId ? { ...c, members: c.members.filter(m => m.id !== memberId) } : c
    ));
  };

  const saveEditMember = () => {
    if (!editMemberForm.name.trim()) return;
    update(committees.map(c =>
      c.id === editMember.committeeId
        ? { ...c, members: c.members.map(m => m.id === editMember.member.id ? { ...m, ...editMemberForm } : m) }
        : c
    ));
    setEditMember(null);
    showToast("Member updated!");
  };

  if (!committees) return <div style={{ color: "#64748b", padding: 20 }}>Loading committees...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Committee Sections</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Manage all committee sections. Click a section to expand and add/remove members.
            </div>
          </div>
          <button onClick={() => setShowAddCommittee(!showAddCommittee)}
            style={{ background: "linear-gradient(135deg, #002b5b, #00a6a6)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            ＋ New Committee Section
          </button>
        </div>

        {/* Add Committee Form */}
        {showAddCommittee && (
          <div style={{ background: "#111827", border: "1px solid rgba(0,166,166,0.3)", borderRadius: 12, padding: 18, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6", marginBottom: 14 }}>➕ Add New Committee Section</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "flex-end" }}>
              {/* Icon picker */}
              <div>
                <label style={fLabel}>Icon</label>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ width: 48, height: 44, background: "rgba(0,166,166,0.15)", border: "1px solid rgba(0,166,166,0.3)", borderRadius: 8, fontSize: 22, cursor: "pointer" }}>
                    {newCommittee.icon}
                  </button>
                  {showEmojiPicker && (
                    <div style={{ position: "absolute", top: 50, left: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 10, display: "flex", flexWrap: "wrap", gap: 6, width: 200, zIndex: 10 }}>
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} onClick={() => { setNewCommittee(p => ({ ...p, icon: e })); setShowEmojiPicker(false); }}
                          style={{ background: newCommittee.icon === e ? "rgba(0,166,166,0.3)" : "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4, borderRadius: 6 }}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={fLabel}>Committee Name *</label>
                <input style={fInput} value={newCommittee.title} placeholder="e.g. Managerial Committee"
                  onChange={e => setNewCommittee(p => ({ ...p, title: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addCommittee()} autoFocus />
              </div>
              <button onClick={addCommittee} disabled={saving}
                style={{ background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Add Section
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Committee sections list */}
      {committees.map((com) => {
        const isExpanded = expandedId === com.id;
        return (
          <div key={com.id} style={{ background: "#0d1424", border: `1px solid ${isExpanded ? "rgba(0,166,166,0.35)" : "#1e293b"}`, borderRadius: 16, overflow: "hidden", transition: "border 0.2s" }}>

            {/* Committee header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: isExpanded ? "rgba(0,166,166,0.04)" : "transparent", cursor: "pointer" }}
              onClick={() => setExpandedId(isExpanded ? null : com.id)}>

              {/* Icon + emoji picker inline */}
              <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button title="Change icon"
                  style={{ width: 42, height: 42, background: "linear-gradient(135deg, #002b5b, #00a6a6)", borderRadius: 10, border: "none", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {com.icon}
                </button>
                <div style={{ position: "absolute", bottom: -2, right: -4, background: "#00a6a6", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", cursor: "pointer" }}
                  onClick={() => setShowEmojiPicker(showEmojiPicker === com.id ? null : com.id)}>✎</div>
                {showEmojiPicker === com.id && (
                  <div style={{ position: "absolute", top: 50, left: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 10, display: "flex", flexWrap: "wrap", gap: 6, width: 200, zIndex: 20 }}>
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => { updateCommitteeIcon(com.id, e); setShowEmojiPicker(null); }}
                        style={{ background: com.icon === e ? "rgba(0,166,166,0.3)" : "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4, borderRadius: 6 }}>{e}</button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{com.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{com.members.length} member{com.members.length !== 1 ? "s" : ""}</div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => { setAddMemberFor(addMemberFor === com.id ? null : com.id); setExpandedId(com.id); }}
                  title="Add member to this committee"
                  style={{ background: "rgba(0,166,166,0.12)", border: "1px solid rgba(0,166,166,0.3)", color: "#00a6a6", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  ＋ Add Member
                </button>
                <button onClick={() => removeCommittee(com.id)}
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#ef4444", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  🗑
                </button>
                <span style={{ fontSize: 18, color: "#475569", lineHeight: 1, padding: "4px" }}>{isExpanded ? "▾" : "▸"}</span>
              </div>
            </div>

            {/* Add member form for this committee */}
            {addMemberFor === com.id && (
              <div style={{ padding: "0 22px 18px" }}>
                <div style={{ background: "#111827", border: "1px solid rgba(0,166,166,0.25)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6", marginBottom: 10 }}>Add member to "{com.title}"</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                    <div>
                      <label style={fLabel}>Name *</label>
                      <input style={fInput} value={newMember.name} placeholder="Full name"
                        onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addMember(com.id)} autoFocus />
                    </div>
                    <div>
                      <label style={fLabel}>Role / Designation</label>
                      <input style={fInput} value={newMember.role} placeholder="e.g. Member, Chairman"
                        onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => addMember(com.id)} disabled={saving}
                        style={{ background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Add
                      </button>
                      <button onClick={() => setAddMemberFor(null)}
                        style={{ background: "#374151", color: "#e2e8f0", border: "none", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members list */}
            {isExpanded && (
              <div style={{ padding: "4px 22px 22px" }}>
                {com.members.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#475569", fontSize: 13 }}>
                    No members yet. Click "+ Add Member" above.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                    {com.members.map(member => (
                      <div key={member.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        {editMember?.member.id === member.id && editMember?.committeeId === com.id ? (
                          // Inline edit form
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                            <input style={{ ...fInput, padding: "6px 10px" }} value={editMemberForm.name}
                              onChange={e => setEditMemberForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
                            <input style={{ ...fInput, padding: "6px 10px" }} value={editMemberForm.role}
                              onChange={e => setEditMemberForm(p => ({ ...p, role: e.target.value }))} placeholder="Role" />
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={saveEditMember}
                                style={{ flex: 1, background: "#00a6a6", color: "#fff", border: "none", padding: "6px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Save</button>
                              <button onClick={() => setEditMember(null)}
                                style={{ background: "#374151", color: "#e2e8f0", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>✕</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</div>
                              <div style={{ fontSize: 11, color: "#00a6a6", fontWeight: 600, marginTop: 2 }}>{member.role}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                              <button onClick={() => { setEditMember({ committeeId: com.id, member }); setEditMemberForm({ name: member.name, role: member.role }); }}
                                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", color: "#60a5fa", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✎</button>
                              <button onClick={() => removeMember(com.id, member.id)}
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════
// BOD CARDS MANAGER
// Admin can add, edit, remove, reorder BOD director cards
// Stored in CMS as JSON under key "bod_cards"
// ══════════════════════════════════════════
const DEFAULT_BOD_CARDS = [
  {
    id: "bod_1",
    name: "Dr. Sandip Kumar Deb",
    title: "Chairperson",
    image: "/assets/Sandip_Kumar_Deb.avif",
    preview: "Mr. Sandip Kumar Deb is the Vice Chairman of the Tangible Assets Board of IVSC. He is the Registered Valuer Director of the Assessors and Registered Valuers Foundation of India...",
    bio: "Mr. Sandip Kumar Deb is the Vice Chairman of the Tangible Assets Board of IVSC. He is the Registered Valuer Director of the Assessors and Registered Valuers Foundation of India. Having degree in Civil Engineering, Law, Quantity Surveying and Valuation, Sandip has completed his post gradation in Land and Building Valuation as well as Plant & Machinery Valuation."
  },
  {
    id: "bod_2",
    name: "Mr. Praveen Kumar Gupta",
    title: "Director",
    image: "/assets/Praveen Gupta.avif",
    preview: "With a distinguished career spanning over four decades, Praveen Kumar Gupta has been a stalwart in India's cooperative movement. As an advisory member to several National Cooperative Federations...",
    bio: "With a distinguished career spanning over four decades, Praveen Kumar Gupta has been a stalwart in India's cooperative movement. As an advisory member to several National Cooperative Federations, his visionary leadership has significantly shaped the cooperative ecosystem across diverse sectors. His enduring commitment reflects a legacy of service, policy influence, and institutional development within the cooperative space."
  },
  {
    id: "bod_3",
    name: "Mr. Praveen Subramanya",
    title: "Director",
    image: "/assets/PS.avif",
    preview: "Praveen Subramanya is a valuation expert with over 21 years of experience across real estate, business, financial instruments, and plant & machinery in India and international markets...",
    bio: "Praveen Subramanya is a valuation expert with over 21 years of experience across real estate, business, financial instruments, and plant & machinery in India and international markets. He is a Chartered Engineer, Member of RICS (UK), and Managing Director of IACVS - India Chapter. Having led valuation and risk teams at Knight Frank, Edelweiss, and ICICI Bank, Mr. Praveen has overseen portfolios over 33,000 Cr. He is also an accredited arbitrator and mediator and regularly contributes to valuation panels, training programs, and industry bodies including IBBI and RVOS."
  },
  {
    id: "bod_4",
    name: "Mr. Saurabh Gupta",
    title: "Director",
    image: "/assets/SG.avif",
    preview: "Saurabh Gupta is a seasoned management professional with nearly two decades of experience in consulting, business development, and strategic leadership. As Managing Director of AaRVF...",
    bio: "Saurabh Gupta is a seasoned management professional with nearly two decades of experience in consulting, business development, and strategic leadership. As Managing Director of AaRVF and a member of the IVSC Asia Committee, he has been instrumental in aligning Indian valuation practices with global standards. Saurabh is known for his entrepreneurial approach, mentorship, and commitment to elevating the valuation profession through strategic partnerships and innovation."
  },
  {
    id: "bod_5",
    name: "Mr. Rahul Sharma",
    title: "Director",
    image: "/assets/Rahul Sharma.avif",
    preview: "With over 14 years of experience, Rahul Sharma is a seasoned professional in commercial operations, stakeholder liaison, and strategic business development. He has successfully interfaced with Indian Railways...",
    bio: "With over 14 years of experience, Rahul Sharma is a seasoned professional in commercial operations, stakeholder liaison, and strategic business development. He has successfully interfaced with Indian Railways, coal companies, and thermal power plants, managing logistics, contract negotiations, and operational planning. Rahul's strengths lie in streamlining coal supply chains, ensuring efficient fuel movement, and resolving tender-related challenges through effective techno-commercial engagement. His experience includes MIS implementation, cost-benefit analysis, and team leadership to drive impactful project outcomes."
  },
  {
    id: "bod_6",
    name: "Mr. Hariom Giri",
    title: "Director",
    image: "/assets/Hariom Giri.avif",
    preview: "Hariom Giri is a seasoned valuation professional with over 25 years of experience in real estate and infrastructure valuation. As a Property Valuer at GCA Technical Consultants...",
    bio: "Hariom Giri is a seasoned valuation professional with over 25 years of experience in real estate and infrastructure valuation. As a Property Valuer at GCA Technical Consultants he has been actively involved in assessing a wide spectrum of residential, commercial, and industrial properties. An IBBI-registered valuer in the Land & Building asset class, Hariom brings precision, regulatory compliance, and field expertise to every valuation assignment. His work reflects a deep understanding of market dynamics and statutory frameworks that govern property valuation in India."
  },
  {
    id: "bod_7",
    name: "Mr. Sanchit Gupta",
    title: "Director",
    image: "/assets/Sanchit Gupta.avif",
    preview: "Sanchit Gupta is a real estate and construction professional with over 10 years of experience in sales, project coordination, and client relationship management across India's built environment sector...",
    bio: "Sanchit Gupta is a real estate and construction professional with over 10 years of experience in sales, project coordination, and client relationship management across India's built environment sector. An MBA in Construction Project Management, he brings a strategic blend of technical insight and business acumen to complex real estate ventures. Sanchit has consistently delivered value through structured sales strategies, market development, and strong execution capabilities, making him a reliable contributor to both residential and commercial infrastructure growth."
  }
];

function BODCardsManager({ token, showToast, cms, onUpdate }) {
  const [cards, setCards] = useState(null);
  const [editingCard, setEditingCard] = useState(null); // card being edited, or "new"
  const [form, setForm] = useState({ id: "", name: "", title: "", image: "", preview: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Load cards from CMS
  useEffect(() => {
    const cmsMap = {};
    cms.forEach(item => { if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value; });
    const raw = cmsMap["bod_cards"];
    if (raw) {
      try { setCards(JSON.parse(raw)); } catch { setCards([...DEFAULT_BOD_CARDS]); }
    } else {
      setCards([...DEFAULT_BOD_CARDS]);
    }
  }, [cms]);

  const saveCards = async (newCards) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "bod_cards", value: JSON.stringify(newCards), type: "text" }),
      });
      if (res.ok) {
        showToast("BOD cards updated! Changes are live.");
        if (onUpdate) onUpdate();
      }
      else showToast("Failed to save", "error");
    } catch { showToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleSaveCard = () => {
    if (!form.name.trim() || !form.title.trim()) { showToast("Name and Title are required", "error"); return; }
    let newCards;
    if (editingCard === "new") {
      const newCard = { ...form, id: `bod_${Date.now()}` };
      newCards = [...cards, newCard];
    } else {
      newCards = cards.map(c => c.id === form.id ? { ...form } : c);
    }
    setCards(newCards);
    saveCards(newCards);
    setEditingCard(null);
    setForm({ id: "", name: "", title: "", image: "", preview: "", bio: "" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this director card?")) return;
    const newCards = cards.filter(c => c.id !== id);
    setCards(newCards);
    saveCards(newCards);
  };

  const openEdit = (card) => {
    setForm({ ...card });
    setEditingCard(card.id);
  };

  const openNew = () => {
    setForm({ id: "", name: "", title: "Director", image: "", preview: "", bio: "" });
    setEditingCard("new");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/cms/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok && data.url) setForm(prev => ({ ...prev, image: data.url }));
      else showToast("Upload failed", "error");
    } catch { showToast("Upload failed", "error"); }
    setUploading(false);
    e.target.value = "";
  };

  // Drag reorder
  const handleDrop = (dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...cards];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    setCards(reordered);
    saveCards(reordered);
    setDragIdx(null); setDragOverIdx(null);
  };

  if (!cards) return <div style={{ color: "#64748b", padding: 20 }}>Loading BOD cards...</div>;

  return (
    <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Board of Directors Cards</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Add, edit, remove or reorder director cards. Drag cards to reorder.</div>
        </div>
        <button onClick={openNew}
          style={{ background: "linear-gradient(135deg, #002b5b, #00a6a6)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          ＋ Add Director Card
        </button>
      </div>

      {/* Card editor form */}
      {editingCard && (
        <div style={{ background: "#111827", border: "1px solid rgba(0,166,166,0.3)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#00a6a6", marginBottom: 16 }}>
            {editingCard === "new" ? "➕ Add New Director Card" : `✏️ Editing: ${form.name}`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={fLabel}>Full Name *</label>
              <input style={fInput} value={form.name} placeholder="e.g. Dr. John Smith"
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={fLabel}>Title / Designation *</label>
              <input style={fInput} value={form.title} placeholder="e.g. Chairperson, Director"
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={fLabel}>Photo (URL or upload)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input style={{ ...fInput, flex: 1 }} value={form.image} placeholder="Paste image URL or upload below"
                onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />
              <button style={{ background: "rgba(0,166,166,0.15)", border: "1px solid rgba(0,166,166,0.3)", color: "#00a6a6", padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", opacity: uploading ? 0.6 : 1 }}
                onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "⏳ Uploading..." : "📁 Upload Photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
            {form.image && <img src={form.image} alt="preview" style={{ marginTop: 8, width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid #00a6a6" }} />}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={fLabel}>Preview Text (shown on card — 2-3 lines)</label>
            <textarea style={{ ...fInput, minHeight: 60, resize: "vertical" }} value={form.preview}
              placeholder="Short excerpt shown on the card before clicking Read More..."
              onChange={e => setForm(p => ({ ...p, preview: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={fLabel}>Full Bio (shown in modal when Read More is clicked)</label>
            <textarea style={{ ...fInput, minHeight: 100, resize: "vertical" }} value={form.bio}
              placeholder="Full biography shown when user clicks Read More..."
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSaveCard} disabled={saving}
              style={{ background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : editingCard === "new" ? "✓ Add Card" : "✓ Save Changes"}
            </button>
            <button onClick={() => setEditingCard(null)}
              style={{ background: "#374151", color: "#e2e8f0", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cards.map((card, idx) => (
          <div key={card.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: dragOverIdx === idx ? "rgba(0,166,166,0.08)" : "#111827", border: `1px solid ${dragOverIdx === idx ? "#00a6a6" : "#1e293b"}`, borderRadius: 12, cursor: "grab", opacity: dragIdx === idx ? 0.5 : 1, transition: "all 0.15s" }}>
            {/* Drag handle */}
            <span style={{ fontSize: 18, color: "#475569", cursor: "grab", flexShrink: 0 }}>⠿</span>
            {/* Photo */}
            <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #002b5b, #00a6a6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {card.image
                ? <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 18, color: "#fff" }}>👤</span>}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{card.name}</div>
              <div style={{ fontSize: 12, color: "#00a6a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{card.title}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.preview?.slice(0, 60)}…</div>
            </div>
            {/* Order badge */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#1e293b", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>#{idx + 1}</div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => openEdit(card)}
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ✏ Edit
              </button>
              <button onClick={() => handleDelete(card.id)}
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                🗑 Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: 14 }}>
          No director cards yet. Click "+ Add Director Card" to add one.
        </div>
      )}
    </div>
  );
}

// Shared mini-styles for BODCardsManager form
const fLabel = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 };
const fInput = { width: "100%", padding: "9px 12px", background: "#0d1424", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function PageList({ pages, selectedPage, onSelect, cmsMap }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: "72vh", overflowY: "auto" }}>
      {pages.map(page => {
        const isActive = selectedPage?.page === page.page;
        const filledCount = page.fields.filter(f => cmsMap[f.key] && cmsMap[f.key] !== "__deleted__").length;
        return (
          <button key={page.page}
            style={{ ...s.pageBtn, ...(isActive ? s.pageBtnActive : {}) }}
            onClick={() => onSelect(page)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{page.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#00a6a6" : "#e2e8f0" }}>{page.page}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
                  {page.page === "User Dashboard" ? "Form editor" : `${filledCount}/${page.fields.length} customised`}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════
// TEAM PANEL
// ══════════════════════════════════════════
function UserTypeMasterPanel({ token, cms = [], onUpdate, showToast }) {
  const [teamRoles, setTeamRoles] = useState(DEFAULT_TEAM_ROLES);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [savingRoles, setSavingRoles] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const cmsMap = {};
    cms.forEach((item) => {
      if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
    });
    setTeamRoles(parseTeamRoles(cmsMap[TEAM_ROLE_MASTER_CMS_KEY]));
  }, [cms]);

  const saveTeamRoles = async (nextRoles) => {
    const cleaned = [...new Set(nextRoles.map((role) => String(role || "").trim()).filter(Boolean))];
    if (!cleaned.length) {
      showToast("At least one user type is required", "error");
      return false;
    }

    setSavingRoles(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key: TEAM_ROLE_MASTER_CMS_KEY,
          value: JSON.stringify(cleaned),
          type: "text",
        }),
      });

      if (!res.ok) {
        showToast("Failed to save user types", "error");
        return false;
      }

      setTeamRoles(cleaned);
      if (onUpdate) await onUpdate();
      showToast("User type master updated");
      return true;
    } catch {
      showToast("Failed to save user types", "error");
      return false;
    } finally {
      setSavingRoles(false);
    }
  };

  const handleAddRole = async () => {
    const name = newRoleName.trim();
    if (!name) {
      showToast("Enter a user type", "error");
      return;
    }
    if (teamRoles.some((role) => role.toLowerCase() === name.toLowerCase())) {
      showToast("User type already exists", "error");
      return;
    }
    const saved = await saveTeamRoles([...teamRoles, name]);
    if (saved) setNewRoleName("");
  };

  const handleUpdateRole = async (oldName) => {
    const name = roleDraft.trim();
    if (!name) {
      showToast("Enter a user type", "error");
      return;
    }
    if (teamRoles.some((role) => role !== oldName && role.toLowerCase() === name.toLowerCase())) {
      showToast("User type already exists", "error");
      return;
    }
    const saved = await saveTeamRoles(teamRoles.map((role) => (role === oldName ? name : role)));
    if (saved) {
      setEditingRole(null);
      setRoleDraft("");
    }
  };

  const confirmDeleteRole = async () => {
    if (!deleteTarget) return;
    if (teamRoles.length <= 1) {
      showToast("At least one user type is required", "error");
      setDeleteTarget(null);
      return;
    }
    await saveTeamRoles(teamRoles.filter((role) => role !== deleteTarget));
    setDeleteTarget(null);
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <span style={s.cardTitle}>User Type Master</span>
            <div style={{ color: "var(--admin-muted)", fontSize: 12, marginTop: 6 }}>
              These values appear in the team member designation dropdown.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <input
            style={s.fieldInput}
            value={newRoleName}
            placeholder="Sales, Operations, Manager..."
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddRole(); }}
          />
          <button type="button" style={{ ...s.publishBtn, width: 110, opacity: savingRoles ? 0.6 : 1 }} onClick={handleAddRole} disabled={savingRoles}>
            Add
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {teamRoles.map((role) => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 10 }}>
              {editingRole === role ? (
                <>
                  <input
                    style={{ ...s.fieldInput, padding: "8px 10px", fontSize: 13 }}
                    value={roleDraft}
                    onChange={(e) => setRoleDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleUpdateRole(role); }}
                  />
                  <button type="button" style={s.actionBtn} onClick={() => handleUpdateRole(role)} disabled={savingRoles}>Save</button>
                  <button type="button" style={s.revokeBtn} onClick={() => { setEditingRole(null); setRoleDraft(""); }} disabled={savingRoles}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, color: "var(--admin-text)", fontSize: 14, fontWeight: 700 }}>{role}</span>
                  <button type="button" style={s.actionBtn} onClick={() => { setEditingRole(role); setRoleDraft(role); }} disabled={savingRoles}>Edit</button>
                  <button type="button" style={s.revokeBtn} onClick={() => setDeleteTarget(role)} disabled={savingRoles || teamRoles.length <= 1}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {deleteTarget && (
        <div onClick={() => !savingRoles && setDeleteTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 100%)", background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 18, boxShadow: "0 24px 80px rgba(0,0,0,0.45)", padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--admin-text-strong)" }}>Delete User Type?</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--admin-muted)" }}>
              Delete {deleteTarget} from the user type master? Existing team members keep their saved designation until edited.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button type="button" style={s.actionBtn} onClick={() => setDeleteTarget(null)} disabled={savingRoles}>Cancel</button>
              <button type="button" style={{ ...s.publishBtn, width: "auto", minWidth: 130, opacity: savingRoles ? 0.7 : 1 }} onClick={confirmDeleteRole} disabled={savingRoles}>
                {savingRoles ? "Please wait..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPanel({ admins, token, cms = [], onRefresh, showToast }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", designation: "Sales", email: "", phone: "", password: "" });
  const [teamRoles, setTeamRoles] = useState(DEFAULT_TEAM_ROLES);
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [addingDemo, setAddingDemo] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const cmsMap = {};
    cms.forEach((item) => {
      if (item.value && item.value !== "__deleted__") cmsMap[item.key] = item.value;
    });
    const roles = parseTeamRoles(cmsMap[TEAM_ROLE_MASTER_CMS_KEY]);
    setTeamRoles(roles);
    setForm((current) => (
      roles.includes(current.designation)
        ? current
        : { ...current, designation: roles[0] || "Admin" }
    ));
  }, [cms]);

  const handleAdd = async () => {
    if (!form.firstName || !form.email || !form.password) { showToast("Fill required fields", "error"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { showToast("Team member added successfully"); setForm({ firstName: "", lastName: "", designation: teamRoles[0] || "Admin", email: "", phone: "", password: "" }); await onRefresh(); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Failed", "error"); }
    setAdding(false);
  };

  const performAddDemo = async () => {
    const stamp = Date.now();
    const demo = {
      firstName: "Dummy",
      lastName: "Persona",
      designation: teamRoles.includes("Operations") ? "Operations" : (teamRoles[0] || "Admin"),
      email: `dummy.persona.${stamp}@covindia.com`,
      phone: "+91 99999 00000",
      password: "Demo@12345",
    };

    setAddingDemo(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(demo),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Demo team member added");
        await onRefresh();
      } else {
        showToast(data.message || "Failed to add demo member", "error");
      }
    } catch {
      showToast("Failed to add demo member", "error");
    }
    setAddingDemo(false);
  };

  const performToggleActive = async (admin) => {
    const nextStatus = admin.isActive === false;
    setTogglingId(admin._id);
    try {
      const res = await fetch(`/api/admin/admins/${admin._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: nextStatus })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(nextStatus ? "Admin activated" : "Admin deactivated");
        await onRefresh();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch { showToast("Failed", "error"); }
    setTogglingId(null);
  };

  const openAddDemoModal = () => {
    setConfirmModal({
      type: "addDemo",
      title: "Add Demo Persona?",
      message: "This will create a temporary team member named Dummy Persona for testing the active/inactive flow.",
      confirmLabel: "Add Demo Persona",
    });
  };

  const openToggleModal = (admin) => {
    const nextStatus = admin.isActive === false;
    setConfirmModal({
      type: "toggleActive",
      admin,
      title: `${nextStatus ? "Activate" : "Deactivate"} Team Member?`,
      message: `Do you want to ${nextStatus ? "activate" : "deactivate"} ${admin.firstName} ${admin.lastName}?`,
      confirmLabel: nextStatus ? "Activate" : "Deactivate",
    });
  };

  const handleConfirmModal = async () => {
    if (!confirmModal) return;
    setConfirmBusy(true);
    try {
      if (confirmModal.type === "addDemo") {
        await performAddDemo();
      } else if (confirmModal.type === "toggleActive") {
        await performToggleActive(confirmModal.admin);
      }
    } finally {
      setConfirmBusy(false);
      setConfirmModal(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: "0 0 360px" }}>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Add Team Member</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={s.fieldLabel}>First Name *</label><input style={s.fieldInput} value={form.firstName} placeholder="First name" onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><label style={s.fieldLabel}>Last Name</label><input style={s.fieldInput} value={form.lastName} placeholder="Last name" onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div>
              <label style={s.fieldLabel}>Designation / Team Role</label>
              <select
                style={s.fieldInput}
                value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
              >
                {teamRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div><label style={s.fieldLabel}>Email *</label><input style={s.fieldInput} type="email" value={form.email} placeholder="admin@covindia.com" onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label style={s.fieldLabel}>Phone</label><input style={s.fieldInput} value={form.phone} placeholder="+91" onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label style={s.fieldLabel}>Password *</label><input style={s.fieldInput} type="password" value={form.password} placeholder="••••••••" onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <button style={{ ...s.publishBtn, opacity: adding ? 0.7 : 1 }} onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "+ Register Admin Account"}
            </button>
            <button
              style={{
                ...s.publishBtn,
                background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                opacity: addingDemo ? 0.7 : 1
              }}
              onClick={openAddDemoModal}
              disabled={addingDemo}
            >
              {addingDemo ? "Adding Demo..." : "+ Add Demo Persona"}
            </button>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
              Adds a unique test team member named Dummy Persona so you can try active/inactive toggling right away.
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={s.card}>
          <div style={s.cardHeader}><span style={s.cardTitle}>Authorized Personnel ({admins.length})</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {admins.length === 0 && <Empty text="No admins added yet" />}
            {admins.map(a => (
              <div key={a._id} style={s.adminRow}>
                <div style={s.adminAvatar}>{a.firstName?.[0]}{a.lastName?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{a.firstName} {a.lastName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{a.email}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {a.role === "super-admin" ? "Super Admin" : (a.designation || "Admin")}
                  </div>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    width: "fit-content",
                    color: a.isActive === false ? "#991b1b" : "#065f46",
                    background: a.isActive === false ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.12)"
                  }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: a.isActive === false ? "#ef4444" : "#10b981",
                      display: "inline-block"
                    }} />
                    {a.isActive === false ? "Inactive" : "Active"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#00a6a6", background: "rgba(0,166,166,0.1)", padding: "3px 10px", borderRadius: 20 }}>{a.role}</span>
                  <button
                    style={{
                      ...s.revokeBtn,
                      borderColor: a.isActive === false ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)",
                      color: a.isActive === false ? "#10b981" : "#ef4444",
                      opacity: togglingId === a._id ? 0.6 : 1
                    }}
                    onClick={() => openToggleModal(a)}
                    disabled={togglingId === a._id}
                  >
                    {togglingId === a._id ? "Saving..." : a.isActive === false ? "Activate" : "Deactivate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirmModal && (
        <div
          onClick={() => !confirmBusy && setConfirmModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.62)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background: "var(--admin-sidebar-bg)",
              border: "1px solid var(--admin-border)",
              borderRadius: 18,
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
              padding: 24
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--admin-text-strong)" }}>{confirmModal.title}</div>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--admin-muted)" }}>{confirmModal.message}</div>
              </div>
              <button
                type="button"
                onClick={() => !confirmBusy && setConfirmModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--admin-muted)",
                  fontSize: 18,
                  cursor: confirmBusy ? "not-allowed" : "pointer",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => !confirmBusy && setConfirmModal(null)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--admin-border)",
                  color: "var(--admin-text)",
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: confirmBusy ? "not-allowed" : "pointer"
                }}
                disabled={confirmBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModal}
                style={{
                  ...s.publishBtn,
                  width: "auto",
                  minWidth: 150,
                  opacity: confirmBusy ? 0.7 : 1
                }}
                disabled={confirmBusy}
              >
                {confirmBusy ? "Please wait..." : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HELPERS ──
// ══════════════════════════════════════════
// CONTACT MESSAGE CARD
// Shows full message with expand/collapse and delete
// ══════════════════════════════════════════
function ContactMessageCard({ contact: c, token, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete message from ${c.name}?`)) return;
    setDeleting(true);
    try {
      if (c._id) {
        await fetch(`/api/contact/${c._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onDelete();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  return (
    <div style={{ borderBottom: "1px solid #1e293b", padding: "14px 16px" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #004080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#7dd3fc", flexShrink: 0 }}>
          {c.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{c.name}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                onClick={() => setExpanded(!expanded)}>
                {expanded ? "▲ Less" : "▼ Read"}
              </button>

            </div>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{c.email}{c.phone ? ` · ${c.phone}` : ""}</div>
          {c.subject && (
            <div style={{ fontSize: 12, color: "#00a6a6", fontWeight: 600, marginTop: 3 }}>Subject: {c.subject}</div>
          )}
          {/* Always show truncated message; expand shows full */}
          <div style={{
            fontSize: 13, color: "#94a3b8", marginTop: 6, lineHeight: 1.6,
            ...(expanded ? {} : { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }),
          }}>
            {c.message}
          </div>
          {expanded && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(c.email)}&su=${encodeURIComponent(`Re: ${c.subject || "Your enquiry to COV India"}`)}&body=${encodeURIComponent(`Dear ${c.name},\n\nThank you for reaching out to us.\n\n`)}`}
                target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: "#60a5fa", textDecoration: "none", fontWeight: 700, background: "rgba(96,165,250,0.1)", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}>
                ✉ Reply via Gmail
              </a>
              {c.phone && (
                <a href={`tel:${c.phone}`}
                  style={{ fontSize: 11, color: "#34d399", textDecoration: "none", fontWeight: 700, background: "rgba(52,211,153,0.1)", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  📞 Call
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return <button style={{ background: "transparent", border: `1px solid ${color}`, color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }} onClick={onClick}>{label}</button>;
}
function DR({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b", fontSize: 13 }}>
      <span style={{ color: "#64748b", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontWeight: 600, textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}
function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "24px", color: "#475569", fontSize: 13 }}>{text}</div>;
}

function LeadsCRMPanel({ admins = [], token, showToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedLead, setSelectedLead] = useState(null);

  // CRM Detail States
  const [noteContent, setNoteContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load leads", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const name = lead.name || "";
      const email = lead.email || "";
      const phone = lead.phone || "";
      const subject = lead.subject || "";
      const message = lead.message || "";
      const searchStr = `${name} ${email} ${phone} ${subject} ${message}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchQuery]);

  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads];
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "followUp") {
      list.sort((a, b) => {
        if (!a.followUpDate) return 1;
        if (!b.followUpDate) return -1;
        return new Date(a.followUpDate) - new Date(b.followUpDate);
      });
    }
    return list;
  }, [filteredLeads, sortBy]);

  const counts = useMemo(() => {
    const tNew = leads.filter(l => l.status === "New").length;
    const tFollow = leads.filter(l => l.status === "Follow Up").length;
    const tClosed = leads.filter(l => l.status === "Closed").length;
    return { total: leads.length, new: tNew, followUp: tFollow, closed: tClosed };
  }, [leads]);

  const handleOpenDetail = (lead) => {
    setSelectedLead(lead);
    setNoteContent("");
    setAssigneeId(lead.assignedTo?._id || lead.assignedTo || "");
    setFollowUpDate(lead.followUpDate ? lead.followUpDate.split("T")[0] : "");
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/contact/${leadId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${newStatus}`);
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(data.data);
        }
        fetchLeads();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAddNote = async (leadId) => {
    if (!noteContent.trim()) {
      showToast("Please type a note first", "error");
      return;
    }
    try {
      const res = await fetch(`/api/contact/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: noteContent })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Note added");
        setNoteContent("");
        setSelectedLead(data.data);
        fetchLeads();
      } else {
        showToast(data.message || "Failed to add note", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleAssignSave = async (leadId) => {
    try {
      const res = await fetch(`/api/contact/${leadId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedTo: assigneeId || null,
          followUpDate: followUpDate || null
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Assignment details saved");
        setSelectedLead(data.data);
        fetchLeads();
      } else {
        showToast(data.message || "Failed to save assignment", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* METRICS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <StatCard icon="📞" label="Total Inquiries" value={counts.total} accent="#3b82f6" delta="Registered" />
        <StatCard icon="✨" label="New Inquiries" value={counts.new} accent="#f59e0b" delta="Action Required" />
        <StatCard icon="⌛" label="In Follow-Up" value={counts.followUp} accent="#10b981" delta="Active Leads" />
        <StatCard icon="✓" label="Closed Inquiries" value={counts.closed} accent="#8b5cf6" delta="Resolved Leads" />
      </div>

      {/* FILTER BAR */}
      <div style={{ background: "#0c1424", border: "1px solid #1e293b", borderRadius: 16, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {/* SEARCH & SORT */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
            <input 
              type="text" 
              placeholder="Search leads by name, email, message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...s.fieldInput, flex: 1, background: "#070d18" }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ ...s.fieldInput, width: 180, background: "#070d18" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="followUp">Follow-up Date</option>
            </select>
          </div>

          {/* STATUS TABS */}
          <div style={{ display: "flex", background: "#070d18", borderRadius: 10, padding: 3, border: "1px solid #1e293b" }}>
            {[
              { key: "All", label: "All", count: counts.total },
              { key: "New", label: "New", count: counts.new },
              { key: "Follow Up", label: "Follow Up", count: counts.followUp },
              { key: "Closed", label: "Closed", count: counts.closed }
            ].map(tab => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  style={{
                    background: active ? "linear-gradient(135deg, #002b5b, #004080)" : "transparent",
                    color: active ? "#fff" : "#64748b",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s"
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: 10,
                    background: active ? "rgba(255,255,255,0.2)" : "rgba(30,41,59,0.8)",
                    color: active ? "#fff" : "#475569",
                    padding: "1px 5px",
                    borderRadius: 4
                  }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEADS LIST TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Client Details</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Subject & Message</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Assigned To</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Follow-up Date</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 24, color: "#64748b" }}>Loading inquiries...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}><Empty text="No inquiries found matching criteria." /></td>
                </tr>
              ) : (
                sortedLeads.map(lead => {
                  const assigneeName = lead.assignedTo 
                    ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                    : "Unassigned";

                  const statusColor = 
                    lead.status === "New" ? { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" } :
                    lead.status === "Follow Up" ? { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#10b981" } :
                    { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", text: "#64748b" };

                  return (
                    <tr key={lead._id} className="table-row" style={{ borderBottom: "1px solid #111827" }}>
                      {/* Client details */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #002b5b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#60a5fa" }}>
                            {lead.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{lead.name}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{lead.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Subject snippet */}
                      <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#00a6a6" }}>{lead.subject || "No Subject"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lead.message}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: lead.assignedTo ? "#e2e8f0" : "#475569" }}>
                          👤 {assigneeName}
                        </span>
                      </td>

                      {/* Follow-up date */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, color: lead.followUpDate ? "#60a5fa" : "#475569", fontWeight: 600 }}>
                          📅 {formatDate(lead.followUpDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          background: statusColor.bg,
                          border: `1px solid ${statusColor.border}`,
                          color: statusColor.text,
                          padding: "4px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenDetail(lead)}
                          style={{
                            background: "rgba(0,166,166,0.1)",
                            border: "1px solid rgba(0,166,166,0.3)",
                            color: "#00a6a6",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          CRM Panel →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM DETAILS MODAL DRAWER */}
      {selectedLead && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedLead(null)}>
          
          <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 16, width: "100%", maxWidth: 950, height: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1424" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Lead CRM Portal</h3>
                <span style={{ fontSize: 11, color: "#64748b" }}>ID: {selectedLead._id}</span>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ background: "#1e293b", border: "none", color: "#64748b", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            {/* Split Panel Body */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left Column - Message Info & Assignment */}
              <div style={{ width: "50%", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", overflowY: "auto", padding: "24px" }}>
                
                {/* Client info box */}
                <div style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#00a6a6", textTransform: "uppercase" }}>Client Details</span>
                  <h4 style={{ margin: "6px 0 2px 0", fontSize: 15, color: "#fff" }}>{selectedLead.name}</h4>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>✉ {selectedLead.email}</div>
                  {selectedLead.phone && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>📞 {selectedLead.phone}</div>}
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>Submitted: {formatDateTime(selectedLead.createdAt)}</div>
                </div>

                {/* Inquiry text */}
                <div style={{ background: "rgba(0,166,166,0.03)", border: "1px dashed rgba(0,166,166,0.2)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#00a6a6", textTransform: "uppercase" }}>Subject: {selectedLead.subject || "General Inquiry"}</span>
                  <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {selectedLead.message}
                  </p>
                </div>

                {/* Status Transitions */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...s.fieldLabel, marginBottom: 10 }}>Lead Workflow Status</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["New", "Follow Up", "Closed"].map(st => {
                      const active = selectedLead.status === st;
                      const activeColors = 
                        st === "New" ? { bg: "#f59e0b", border: "#d97706", text: "#fff" } :
                        st === "Follow Up" ? { bg: "#10b981", border: "#059669", text: "#fff" } :
                        { bg: "#64748b", border: "#475569", text: "#fff" };

                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedLead._id, st)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: active ? activeColors.bg : "#111827",
                            border: `1px solid ${active ? activeColors.border : "#1e293b"}`,
                            color: active ? activeColors.text : "#64748b",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          {st === "Closed" ? "Lead Closed ✓" : st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assignment & Reminders */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "#0d1424", border: "1px solid #1e293b", padding: 16, borderRadius: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#00a6a6", textTransform: "uppercase" }}>Assign & Schedule</span>
                  
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Assign Handling Admin</label>
                    <select
                      value={assigneeId}
                      onChange={e => setAssigneeId(e.target.value)}
                      style={{ ...s.fieldInput, background: "#111827" }}
                    >
                      <option value="">Unassigned</option>
                      {admins.map(adm => (
                        <option key={adm._id} value={adm._id}>{adm.firstName} {adm.lastName} ({adm.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Set Next Follow-up Date</label>
                    <input 
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      style={{ ...s.fieldInput, background: "#111827" }}
                    />
                  </div>

                  <button
                    onClick={() => handleAssignSave(selectedLead._id)}
                    style={{ ...s.actionBtn, background: "#00a6a6", color: "#fff", border: "none", marginTop: 8, padding: "10px", width: "100%", fontSize: 12, fontWeight: 800 }}
                  >
                    Save CRM Settings
                  </button>
                </div>

                {/* Audit Logs */}
                <div style={{ marginTop: 24 }}>
                  <label style={s.fieldLabel}>CRM Audit Timeline</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                    {(!selectedLead.actionLogs || selectedLead.actionLogs.length === 0) ? (
                      <div style={{ fontSize: 12, color: "#475569" }}>No actions logged yet.</div>
                    ) : (
                      selectedLead.actionLogs.map((log, lIdx) => (
                        <div key={log._id || lIdx} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                          <span style={{ color: "#00a6a6", fontWeight: 800 }}>•</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{log.action}</span>
                            <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>by {log.performedByName || "System"}</span>
                            <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 1 }}>{log.details}</div>
                            <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{formatDateTime(log.timestamp)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column - Follow-up Notes Timeline */}
              <div style={{ width: "50%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#070d18", padding: "24px" }}>
                <span style={{ ...s.fieldLabel, marginBottom: 12 }}>Follow-up Conversation Notes ({selectedLead.notes?.length || 0})</span>
                
                {/* Notes History */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8, marginBottom: 20 }}>
                  {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569", fontStyle: "italic", fontSize: 13 }}>
                      No follow-up notes recorded yet. Write a note below to start the conversation timeline.
                    </div>
                  ) : (
                    selectedLead.notes.map((note, nIdx) => (
                      <div key={note._id || nIdx} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#60a5fa" }}>👤 {note.createdByName}</span>
                          <span style={{ fontSize: 10, color: "#475569" }}>{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <div style={{ borderTop: "1px solid #1e293b", paddingTop: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Record New Conversation Note</label>
                  <textarea
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    placeholder="Enter details of your phone call, meeting, or email response to this client..."
                    style={{ width: "100%", padding: "12px 14px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 80, resize: "none" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontSize: 10, color: "#475569" }}>Notes are permanently saved.</span>
                    <button
                      onClick={() => handleAddNote(selectedLead._id)}
                      style={{ ...s.actionBtn, background: "linear-gradient(135deg, #002b5b, #004080)", border: "none", color: "#fff", padding: "8px 16px", fontSize: 12, fontWeight: 800 }}
                    >
                      ✓ Log Note
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── STYLES ──
const s = {
  root: { display: "flex", height: "100vh", background: "var(--admin-shell-bg)", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "var(--admin-text)", overflow: "hidden" },
  sidebar: { background: "var(--admin-sidebar-bg)", borderRight: "1px solid var(--admin-border)", display: "flex", flexDirection: "column", padding: "24px 0", transition: "width 0.25s ease", flexShrink: 0, height: "100vh", overflowY: "auto" },
  sidebarTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 8 },
  logo: { fontSize: 18, fontWeight: 900, color: "var(--admin-text-strong)", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden" },
  collapseBtn: { background: "none", border: "1px solid var(--admin-toolbar-border)", color: "var(--admin-muted)", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 14, flexShrink: 0 },
  themeBtn: { background: "none", border: "1px solid var(--admin-toolbar-border)", color: "var(--admin-muted)", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontSize: 13, flexShrink: 0 },
  sidebarDivider: { height: 1, background: "var(--admin-border)", margin: "12px 0" },
  sidebarNav: { display: "flex", flexDirection: "column", gap: 10, padding: "0 10px", flex: 1, justifyContent: "flex-start" },
  sidebarGroup: { display: "flex", flexDirection: "column", gap: 4, padding: "4px 0" },
  sidebarGroupLabelButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    background: "transparent",
    border: "1px solid transparent",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 800,
    color: "var(--admin-text)",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  sidebarGroupChevron: { fontSize: 16, lineHeight: 1, color: "var(--admin-muted)", transition: "transform 0.2s ease" },
  navBtn: { display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "transparent", border: "1px solid transparent", color: "var(--admin-muted)", cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.2s ease", borderRadius: 10, marginBottom: 2 },
  navBtnActive: { background: "var(--admin-accent-soft)", color: "var(--admin-accent)", border: "1px solid var(--admin-accent-border)", boxShadow: "inset 0 0 12px var(--admin-accent-soft)" },
  navIcon: { fontSize: 16, flexShrink: 0, width: 24, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 14, fontWeight: 600, flex: 1 },
  navPip: { width: 6, height: 6, borderRadius: "50%", background: "var(--admin-accent)", flexShrink: 0 },
  sidebarUser: { display: "flex", alignItems: "center", gap: 10, padding: "0 16px" },
  userAvatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #00a6a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { fontSize: 11, color: "var(--admin-accent)", fontWeight: 600, textTransform: "uppercase" },
  logoutBtn: { background: "none", border: "1px solid var(--admin-toolbar-border)", color: "var(--admin-muted)", padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontSize: 14, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden", background: "var(--admin-shell-bg)" },
  topbar: { padding: "28px 36px 20px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: "var(--admin-topbar-bg)", flexShrink: 0, zIndex: 10 },
  breadcrumb: { fontSize: 11, fontWeight: 700, color: "var(--admin-accent)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 },
  pageTitle: { fontSize: 28, fontWeight: 900, color: "var(--admin-text-strong)", margin: 0, letterSpacing: "-0.5px" },
  livePill: { display: "flex", alignItems: "center", gap: 8, background: "var(--admin-surface)", border: "1px solid var(--admin-border)", padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, color: "var(--admin-text)" },
  liveDot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" },
  refreshBtn: { background: "var(--admin-accent-soft)", border: "1px solid var(--admin-accent-border)", color: "var(--admin-accent)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  themeToggle: { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  iconBtn: { position: "relative", background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, width: 40, height: 40, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text)" },
  badge: { position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid var(--admin-badge-border)" },
  dropdown: { position: "fixed", top: 72, right: 24, width: 340, background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 14, zIndex: 9998, boxShadow: "var(--admin-dropdown-shadow)", overflow: "hidden", maxHeight: 480, overflowY: "auto" },
  dropdownHeader: { padding: "14px 16px", background: "var(--admin-surface)", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 },
  dropdownClose: { background: "none", border: "none", color: "var(--admin-muted)", fontSize: 14, cursor: "pointer" },
  dropdownItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--admin-surface-alt)" },
  dropdownAvatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #00a6a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 },
  dropdownEmpty: { padding: "24px", textAlign: "center", color: "var(--admin-muted-alt)", fontSize: 13 },
  content: { padding: "28px 36px", flex: 1, overflowY: "auto" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 },
  statCard: { background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 14, padding: "22px 24px" },
  statValue: { fontSize: 32, fontWeight: 900, color: "var(--admin-text-strong)", margin: "12px 0 4px", letterSpacing: "-1px" },
  statLabel: { fontSize: 12, color: "var(--admin-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  card: { background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 16, padding: 24 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 800, color: "var(--admin-text-strong)" },
  viewAllBtn: { background: "none", border: "none", color: "var(--admin-accent)", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  breakdownChip: { borderRadius: 12, padding: "16px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 100 },
  filtersRow: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 200, padding: "10px 16px", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 10, color: "var(--admin-text)", fontSize: 14, outline: "none" },
  filterBtn: { padding: "8px 16px", background: "transparent", border: "1px solid var(--admin-border)", borderRadius: 8, color: "var(--admin-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  filterBtnActive: { background: "var(--admin-accent-soft-strong)", border: "1px solid var(--admin-accent)", color: "var(--admin-accent)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--admin-muted-alt)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" },
  tr: { borderBottom: "1px solid var(--admin-surface-alt)" },
  trSelected: { background: "var(--admin-accent-soft)" },
  td: { padding: "12px 14px", color: "var(--admin-muted)", verticalAlign: "middle" },
  memberAvatar: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #004080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#7dd3fc", flexShrink: 0 },
  idCode: { fontSize: 11, background: "var(--admin-surface)", border: "1px solid var(--admin-border)", padding: "2px 8px", borderRadius: 4, color: "var(--admin-accent)", fontFamily: "monospace" },
  statusBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block" },
  detailPanel: { width: 360, flexShrink: 0, background: "var(--admin-sidebar-bg)", border: "1px solid var(--admin-border)", borderRadius: 16, display: "flex", flexDirection: "column", maxHeight: "82vh", overflow: "hidden" },
  detailHeader: { padding: "20px", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  detailAvatar: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #002b5b, #00a6a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 },
  detailName: { fontSize: 16, fontWeight: 800, color: "var(--admin-text-strong)" },
  detailEmail: { fontSize: 12, color: "var(--admin-muted)", marginTop: 2 },
  closePanelBtn: { background: "none", border: "none", color: "var(--admin-muted)", fontSize: 16, cursor: "pointer", padding: 4 },
  detailTabs: { display: "flex", borderBottom: "1px solid var(--admin-border)", padding: "0 12px", overflowX: "auto" },
  detailTab: { background: "none", border: "none", color: "var(--admin-muted)", padding: "10px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderBottom: "2px solid transparent", whiteSpace: "nowrap" },
  detailTabActive: { color: "var(--admin-accent)", borderBottom: "2px solid var(--admin-accent)" },
  detailBody: { flex: 1, overflowY: "auto", padding: "16px" },
  detailActions: { padding: "16px", borderTop: "1px solid var(--admin-border)" },
  actionBtn: { padding: "7px 14px", background: "var(--admin-surface)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  lockBtn: { width: "100%", padding: "9px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  verifyBtn: { marginTop: 8, width: "100%", background: "var(--admin-accent-soft)", border: "1px solid var(--admin-accent-border)", color: "var(--admin-accent)", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  eduCard: { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 10, padding: "12px", marginBottom: 10 },
  pageBtn: { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 10, padding: "12px", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s", marginBottom: 4 },
  pageBtnActive: { border: "1px solid var(--admin-accent)", background: "var(--admin-accent-soft)" },
  fieldBtn: { background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s", marginBottom: 3 },
  fieldBtnActive: { border: "1px solid var(--admin-accent)", background: "var(--admin-accent-soft)" },
  typePill: { fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", flexShrink: 0 },
  fieldLabel: { display: "block", fontSize: 11, fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  fieldInput: { width: "100%", padding: "10px 14px", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 10, color: "var(--admin-text)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  publishBtn: { background: "linear-gradient(135deg, #002b5b, #004080)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", width: "100%" },
  uploadFileBtn: { background: "var(--admin-accent-soft)", border: "1px dashed var(--admin-accent-border)", color: "var(--admin-accent)", padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", textAlign: "center" },
  previewBox: { background: "var(--admin-surface-alt)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  previewLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: "var(--admin-muted)", marginBottom: 4 },
  previewDot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  previewContent: { flex: 1 },
  adminRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--admin-surface)", borderRadius: 10, border: "1px solid var(--admin-border)" },
  adminAvatar: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #002b5b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#60a5fa", flexShrink: 0 },
  revokeBtn: { background: "none", border: "1px solid #fee2e2", color: "#ef4444", padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  toast: { position: "fixed", top: 24, right: 24, color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease" },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  .stat-card:hover { transform: translateY(-2px); transition: transform 0.2s ease; }
  .table-row:hover { background: rgba(0,166,166,0.04) !important; }
  @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--admin-scroll-track); }
  ::-webkit-scrollbar-thumb { background: var(--admin-scroll-thumb); border-radius: 4px; }
  input::placeholder, textarea::placeholder { color: var(--admin-placeholder); }
`;
