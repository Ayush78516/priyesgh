import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const defaultEduRow = () => ({ qualification: "", year: "", marks: "", board: "", college: "", file: null });
const defaultProRow = () => ({ qualification: "", institute: "", membershipNo: "", year: "", validity: "", file: null });

function EducationalDetails() {
  const navigate = useNavigate();

  const [eduRows, setEduRows] = useState([defaultEduRow(), defaultEduRow()]);
  const [proRows, setProRows] = useState([defaultProRow(), defaultProRow()]);

  const eduFileRefs = useRef([]);
  const proFileRefs = useRef([]);

  const handleEduChange = (index, field, value) => {
    const updated = [...eduRows];
    updated[index][field] = value;
    setEduRows(updated);
  };

  const handleProChange = (index, field, value) => {
    const updated = [...proRows];
    updated[index][field] = value;
    setProRows(updated);
  };

  const addEduRow = () => setEduRows([...eduRows, defaultEduRow()]);
  const addProRow = () => setProRows([...proRows, defaultProRow()]);

  return (
    <div className="reg-page reg2-only">
      <div className="container1">
        <h1 className="page-title1">Registration Form</h1>

        {/* Tabs */}
        <div className="tabs1">
          <Link className="tab1" to="/personal">Personal Details</Link>
          <Link className="tab1 active" to="/education">Educational Details</Link>
          <Link className="tab1" to="/work">Work Experience</Link>
        </div>

        <div className="content1">

          {/* Educational Qualification */}
          <div className="qualification-section1">
            <h3 className="section-title1">Educational Qualification</h3>
            <table className="qualification-table1">
              <thead>
                <tr>
                  <th>Educational Qualification</th>
                  <th>Year of Passing</th>
                  <th>% Marks</th>
                  <th>Grade/Class</th>
                  <th>College/University</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {eduRows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <select
                        value={row.qualification}
                        onChange={(e) => handleEduChange(i, "qualification", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="10th">10th</option>
                        <option value="12th">12th</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" placeholder="Year"
                        value={row.year} onChange={(e) => handleEduChange(i, "year", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Marks %"
                        value={row.marks} onChange={(e) => handleEduChange(i, "marks", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Board/Univ"
                        value={row.board} onChange={(e) => handleEduChange(i, "board", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="College/University"
                        value={row.college} onChange={(e) => handleEduChange(i, "college", e.target.value)} />
                    </td>
                    <td>
                      <button className="upload-btn1" type="button"
                        onClick={() => eduFileRefs.current[i]?.click()}>
                        Upload
                      </button>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        style={{ display: "none" }}
                        ref={(el) => (eduFileRefs.current[i] = el)}
                        onChange={(e) => handleEduChange(i, "file", e.target.files[0])}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn1" type="button" onClick={addEduRow}>+ Add Row</button>
          </div>

          {/* Professional Qualification */}
          <div className="qualification-section1">
            <h3 className="section-title1">Professional Qualification</h3>
            <table className="qualification-table1">
              <thead>
                <tr>
                  <th>Professional Qualification</th>
                  <th>Name of the Institute</th>
                  <th>Membership No.</th>
                  <th>Enrolment Year</th>
                  <th>Validity</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {proRows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input type="text" placeholder="Qualification"
                        value={row.qualification} onChange={(e) => handleProChange(i, "qualification", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Institute Name"
                        value={row.institute} onChange={(e) => handleProChange(i, "institute", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Membership No."
                        value={row.membershipNo} onChange={(e) => handleProChange(i, "membershipNo", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Year"
                        value={row.year} onChange={(e) => handleProChange(i, "year", e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Validity"
                        value={row.validity} onChange={(e) => handleProChange(i, "validity", e.target.value)} />
                    </td>
                    <td>
                      <button className="upload-btn1" type="button"
                        onClick={() => proFileRefs.current[i]?.click()}>
                        Upload
                      </button>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        style={{ display: "none" }}
                        ref={(el) => (proFileRefs.current[i] = el)}
                        onChange={(e) => handleProChange(i, "file", e.target.files[0])}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn1" type="button" onClick={addProRow}>+ Add Row</button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons1">
            <button className="back-btn1" type="button" onClick={() => navigate("/personal")}>Back</button>
            <button className="next-btn1" type="button" onClick={() => navigate("/work")}>Next</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EducationalDetails;