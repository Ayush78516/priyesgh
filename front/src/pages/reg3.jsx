import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const defaultExpRow = () => ({
  status: "", years: "", from: "", to: "", employer: "", designation: "", area: "", file: null,
});

const termsQuestions = [
  { name: "question1", text: "Have you every been Convicted for an offence?", defaultYes: false },
  { name: "question2", text: "Whether any criminal proceeding is initiated against you and is pending for disposal before the court of law? (excluding litigation of personal/ matrimonial nature)", defaultYes: false },
  { name: "question3", text: "Have you ever been declared as an undischarged bankrupt or applied to be adjudged as Bankrupt?", defaultYes: false },
  { name: "question4", text: "Have you ever been restrained by any public sector bank / any other institution to conduct valuation services and subsequently de-panelled from their panel", defaultYes: false },
  { name: "question5", text: "Whether any disciplinary proceeding are pending or any disciplinary action has been taken at any time in the preceding three years against you by the institution / body of which you are a member", defaultYes: false },
  { name: "question6", text: "Whether you had an unblemished service with the last employer in case of employment?", defaultYes: true },
  { name: "question7", text: "Whether your name appears in the database of MCA regarding:", defaultYes: false, hasSubList: true },
  { name: "question9", text: "Whether you have been penalised by a market regulator (SEBI or CCI) in the last 3 years?", defaultYes: false },
  { name: "question10", text: "Whether your name appears in the list of defaulters of RBI?", defaultYes: false },
];

const subQuestions = [
  { name: "question8a", text: "Directors disqualified under section 164 of companies act 2013" },
  { name: "question8b", text: "Proclaimed Offenders under section 82 of the code of Criminal Procedure, 1973?" },
];

function WorkExperience() {
  const navigate = useNavigate();
  const [expRows, setExpRows] = useState([defaultExpRow(), defaultExpRow()]);
  const expFileRefs = useRef([]);

  // Initialize radio answers
  const initAnswers = {};
  termsQuestions.forEach((q) => { initAnswers[q.name] = q.defaultYes ? "yes" : "no"; });
  subQuestions.forEach((q) => { initAnswers[q.name] = "no"; });
  const [answers, setAnswers] = useState(initAnswers);

  const handleExpChange = (index, field, value) => {
    const updated = [...expRows];
    updated[index][field] = value;
    setExpRows(updated);
  };

  const addExpRow = () => setExpRows([...expRows, defaultExpRow()]);

  const handleRadioChange = (name, value) => {
    setAnswers({ ...answers, [name]: value });
  };

  const handleSubmit = () => {
    alert("Form Submitted!");
  };

  const RadioGroup = ({ name }) => (
    <div className="radio-group1">
      <div className="radio-option1">
        <input type="radio" id={`${name}-yes`} name={name} value="yes"
          checked={answers[name] === "yes"} onChange={() => handleRadioChange(name, "yes")} />
        <label htmlFor={`${name}-yes`}>Yes</label>
      </div>
      <div className="radio-option1">
        <input type="radio" id={`${name}-no`} name={name} value="no"
          checked={answers[name] === "no"} onChange={() => handleRadioChange(name, "no")} />
        <label htmlFor={`${name}-no`}>No</label>
      </div>
    </div>
  );

  return (
    <div className="reg-page reg3-only">
      <div className="container1">
        <h1 className="page-title1">Registration Form</h1>

        {/* Tabs */}
        <div className="tabs1">
          <Link className="tab1" to="/personal">Personal Details</Link>
          <Link className="tab1" to="/education">Educational Details</Link>
          <Link className="tab1 active" to="/work">Work Experience</Link>
        </div>

        <div className="content1">

          {/* Work Experience Table */}
          <div className="experience-section1">
            <h3 className="section-title1">Work Experience</h3>
            <table className="experience-table1">
              <thead>
                <tr>
                  <th>You are presently</th>
                  <th>Total no. of years in practice/emp</th>
                  <th>Period From</th>
                  <th>Period To</th>
                  <th>Employer</th>
                  <th>Designation</th>
                  <th>Area of Work</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {expRows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <select value={row.status} onChange={(e) => handleExpChange(i, "status", e.target.value)}>
                        <option value="">Select</option>
                        <option value="employment">Employment</option>
                        <option value="practice">Practice</option>
                      </select>
                    </td>
                    <td><input type="text" placeholder="Year" value={row.years} onChange={(e) => handleExpChange(i, "years", e.target.value)} /></td>
                    <td><input type="text" placeholder="From" value={row.from} onChange={(e) => handleExpChange(i, "from", e.target.value)} /></td>
                    <td><input type="text" placeholder="To" value={row.to} onChange={(e) => handleExpChange(i, "to", e.target.value)} /></td>
                    <td><input type="text" placeholder="Employer" value={row.employer} onChange={(e) => handleExpChange(i, "employer", e.target.value)} /></td>
                    <td><input type="text" placeholder="Designation" value={row.designation} onChange={(e) => handleExpChange(i, "designation", e.target.value)} /></td>
                    <td><input type="text" placeholder="Area" value={row.area} onChange={(e) => handleExpChange(i, "area", e.target.value)} /></td>
                    <td>
                      <button className="upload-btn1" type="button" onClick={() => expFileRefs.current[i]?.click()}>Upload</button>
                      <input type="file" accept=".pdf,.jpg,.png" style={{ display: "none" }}
                        ref={(el) => (expFileRefs.current[i] = el)}
                        onChange={(e) => handleExpChange(i, "file", e.target.files[0])} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn1" type="button" onClick={addExpRow}>+ Add Row</button>
          </div>

          {/* Terms Section */}
          <div className="terms-section1">
            <h3 className="section-title1">Terms</h3>
            <ul className="terms-list1">
              {termsQuestions.map((q) => (
                <li key={q.name}>
                  <span>{q.text}</span>
                  <RadioGroup name={q.name} />
                  {q.hasSubList && (
                    <ul className="sub-list">
                      {subQuestions.map((sq) => (
                        <li key={sq.name}>
                          <span>{sq.text}</span>
                          <RadioGroup name={sq.name} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons1">
            <button className="back-btn1" type="button" onClick={() => navigate("/education")}>Back</button>
            <button className="next-btn1" type="button" onClick={handleSubmit}>Submit</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WorkExperience;