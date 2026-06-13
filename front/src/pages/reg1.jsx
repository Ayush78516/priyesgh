import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function PersonalDetails() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", mobile: "",
    fatherHusbandName: "", dob: "", gender: "",
    permAddress1: "", permAddress2: "", permCity: "", permState: "", permDistrict: "", permPincode: "",
    corrAddress1: "", corrAddress2: "", corrCity: "", corrState: "", corrDistrict: "", corrPincode: "",
    panNumber: "", aadharNumber: "", gstNumber: "", passportNumber: "",
  });

  const [picturePreview, setPicturePreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const pictureInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const panInputRef = useRef(null);
  const aadharInputRef = useRef(null);
  const gstInputRef = useRef(null);
  const passportInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagePreview = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="reg-page reg1-only">
      <div className="container1">
        <h1 className="page-title1">Registration Form</h1>

        {/* Tabs */}
        <div className="tabs1">
          <Link className="tab1 active" to="/personal">Personal Details</Link>
          <Link className="tab1" to="/education">Educational Details</Link>
          <Link className="tab1" to="/work">Work Experience</Link>
        </div>

        <div className="content1">

          {/* Personal Details + Upload */}
          <div className="form-grid1">
            <div className="form-section1">
              <h3 className="section-title1">Personal Details</h3>

              <div className="form-row1">
                <div className="form-group1">
                  <label>First Name</label>
                  <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="form-group1">
                  <label>Last Name</label>
                  <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row1">
                <div className="form-group1">
                  <label>Email ID</label>
                  <input type="email" name="email" placeholder="Email ID" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group1">
                  <label>Mobile Number</label>
                  <input type="text" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row1">
                <div className="form-group1">
                  <label>Fathers / Husband Name</label>
                  <input type="text" name="fatherHusbandName" placeholder="Fathers / Husband Name" value={form.fatherHusbandName} onChange={handleChange} />
                </div>
                <div className="form-group1">
                  <label>DOB</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group1">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Upload Picture & Signature */}
            <div className="upload-section1">
              <h3 className="section-title1">Upload Documents</h3>
              <div className="upload-grid1">
                <div className="upload-box1">
                  <div className="preview-area1">
                    {picturePreview
                      ? <img src={picturePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ color: "#999" }}>Picture</span>
                    }
                  </div>
                  <button className="upload-btn1" type="button" onClick={() => pictureInputRef.current.click()}>
                    Upload your Picture
                  </button>
                  <input type="file" ref={pictureInputRef} accept="image/*" style={{ display: "none" }}
                    onChange={(e) => handleImagePreview(e, setPicturePreview)} />
                </div>

                <div className="upload-box1">
                  <div className="preview-area1">
                    {signaturePreview
                      ? <img src={signaturePreview} alt="Signature Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ color: "#999" }}>Signature</span>
                    }
                  </div>
                  <button className="upload-btn1" type="button" onClick={() => signatureInputRef.current.click()}>
                    Upload your Signatures
                  </button>
                  <input type="file" ref={signatureInputRef} accept="image/*" style={{ display: "none" }}
                    onChange={(e) => handleImagePreview(e, setSignaturePreview)} />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="form-grid1">
            {/* Permanent Address */}
            <div className="form-section1">
              <h3 className="section-title1">Permanent Address</h3>
              <div className="form-group1 full-width">
                <label>Address</label>
                <input type="text" name="permAddress1" placeholder="Address" value={form.permAddress1} onChange={handleChange} />
              </div>
              <div className="form-group1 full-width">
                <label>Address</label>
                <input type="text" name="permAddress2" placeholder="Address" value={form.permAddress2} onChange={handleChange} />
              </div>
              <div className="form-row1">
                <div className="form-group1">
                  <label>City</label>
                  <select name="permCity" value={form.permCity} onChange={handleChange}>
                    <option value="">Select City</option>
                  </select>
                </div>
                <div className="form-group1">
                  <label>State</label>
                  <select name="permState" value={form.permState} onChange={handleChange}>
                    <option value="">Select State</option>
                  </select>
                </div>
              </div>
              <div className="form-row1">
                <div className="form-group1">
                  <label>District</label>
                  <select name="permDistrict" value={form.permDistrict} onChange={handleChange}>
                    <option value="">Select District</option>
                  </select>
                </div>
                <div className="form-group1">
                  <label>Pincode</label>
                  <input type="text" name="permPincode" placeholder="Pincode" value={form.permPincode} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Correspondence Address */}
            <div className="form-section1">
              <h3 className="section-title1">Correspondence Address</h3>
              <div className="form-group1 full-width">
                <label>Address</label>
                <input type="text" name="corrAddress1" placeholder="Address" value={form.corrAddress1} onChange={handleChange} />
              </div>
              <div className="form-group1 full-width">
                <label>Address</label>
                <input type="text" name="corrAddress2" placeholder="Address" value={form.corrAddress2} onChange={handleChange} />
              </div>
              <div className="form-row1">
                <div className="form-group1">
                  <label>City</label>
                  <select name="corrCity" value={form.corrCity} onChange={handleChange}>
                    <option value="">Select City</option>
                  </select>
                </div>
                <div className="form-group1">
                  <label>State</label>
                  <select name="corrState" value={form.corrState} onChange={handleChange}>
                    <option value="">Select State</option>
                  </select>
                </div>
              </div>
              <div className="form-row1">
                <div className="form-group1">
                  <label>District</label>
                  <select name="corrDistrict" value={form.corrDistrict} onChange={handleChange}>
                    <option value="">Select District</option>
                  </select>
                </div>
                <div className="form-group1">
                  <label>Pincode</label>
                  <input type="text" name="corrPincode" placeholder="Pincode" value={form.corrPincode} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="upload-section1">
            <h3 className="section-title1">Document Uploads</h3>
            <div className="document-uploads1">

              <div className="doc-upload-item1">
                <input type="text" name="panNumber" placeholder="PAN Number" value={form.panNumber} onChange={handleChange} />
                <button className="doc-upload-btn1" type="button" onClick={() => panInputRef.current.click()}>Upload Pan</button>
                <input type="file" ref={panInputRef} accept=".pdf,.jpg,.png" style={{ display: "none" }} />
              </div>

              <div className="doc-upload-item1">
                <input type="text" name="aadharNumber" placeholder="Aadhar Number" value={form.aadharNumber} onChange={handleChange} />
                <button className="doc-upload-btn1" type="button" onClick={() => aadharInputRef.current.click()}>Upload Aadhar</button>
                <input type="file" ref={aadharInputRef} accept=".pdf,.jpg,.png" style={{ display: "none" }} />
              </div>

              <div className="doc-upload-item1">
                <input type="text" name="gstNumber" placeholder="GST Number" value={form.gstNumber} onChange={handleChange} />
                <button className="doc-upload-btn1" type="button" onClick={() => gstInputRef.current.click()}>Upload GST</button>
                <input type="file" ref={gstInputRef} accept=".pdf,.jpg,.png" style={{ display: "none" }} />
              </div>

              <div className="doc-upload-item1">
                <input type="text" name="passportNumber" placeholder="Passport Number" value={form.passportNumber} onChange={handleChange} />
                <button className="doc-upload-btn1" type="button" onClick={() => passportInputRef.current.click()}>Upload Passport</button>
                <input type="file" ref={passportInputRef} accept=".pdf,.jpg,.png" style={{ display: "none" }} />
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons1">
            <button className="back-btn1" type="button" onClick={() => navigate("/")}>Back</button>
            <button className="next-btn1" type="button" onClick={() => navigate("/education")}>Next</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PersonalDetails;