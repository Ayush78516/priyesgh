import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function generateTempId() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `COV-TEMP-${year}-${random}`;
}

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String },
  trackingId: { type: String },
  bankRefNo: { type: String },
  amount: { type: String },
  memberType: { type: String },
  memberClass: { type: String },
  membershipNo: { type: String },
  validTill: { type: String },
  paymentMode: { type: String },
  cardName: { type: String },
  status: { type: String, default: "Pending" },
  paidAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["super-admin", "admin", "user"], default: "user" },
  designation: { type: String, default: "" },
  emailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  scrutinyStatus: { type: String, enum: ["Pending", "Accepted", "Hold", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  tempMembershipId: { type: String, unique: true },

  personal: {
    title: { type: String, default: "" }, gender: { type: String, default: "" },
    fatherName: { type: String, default: "" }, dob: { type: String, default: "" },
    mobile: { type: String, default: "" },
  },
  permAddress: {
    line1: { type: String, default: "" }, line2: { type: String, default: "" },
    city: { type: String, default: "" }, state: { type: String, default: "" },
    district: { type: String, default: "" }, pincode: { type: String, default: "" },
  },
  corrAddress: {
    line1: { type: String, default: "" }, line2: { type: String, default: "" },
    city: { type: String, default: "" }, state: { type: String, default: "" },
    district: { type: String, default: "" }, pincode: { type: String, default: "" },
  },
  memberDetails: {
    memberClass: { type: String, default: "" }, assetClass: { type: String, default: "" },
    memberType: { type: String, default: "" }, validTill: { type: String, default: "" },
    membershipNo: { type: String, default: "" }, status: { type: String, default: "Pending" },
  },
  education: [{
    qualification: { type: String, default: "" },
    year: { type: String, default: "" },
    marks: { type: String, default: "" },
    board: { type: String, default: "" },
    college: { type: String, default: "" },
    fileName: { type: String, default: "" },
  }],
  professionalQualification: [{
    qualification: { type: String, default: "" },
    institute: { type: String, default: "" },
    membershipNo: { type: String, default: "" },
    year: { type: String, default: "" },
    validity: { type: String, default: "" },
    fileName: { type: String, default: "" },
  }],
  experience: [{
    status: { type: String, default: "" },
    years: { type: String, default: "" },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
    employer: { type: String, default: "" },
    designation: { type: String, default: "" },
    area: { type: String, default: "" },
    fileName: { type: String, default: "" },
  }],
  payments: [PaymentSchema],
  uploadedDocs: { type: Object, default: {} },
  driveData: { type: Object, default: {} },
  gstDetails: {
    gstNumber: { type: String, default: "" },
    companyName: { type: String, default: "" },
    state: { type: String, default: "" },
    stateCode: { type: String, default: "" },
    billingAddress: { type: String, default: "" }
  }
});


UserSchema.pre("save", async function () {
  if (!this.tempMembershipId) {
    let id, exists;
    do {
      id = generateTempId();
      exists = await mongoose.model("User").findOne({ tempMembershipId: id });
    } while (exists);
    this.tempMembershipId = id;
  }
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", UserSchema);
