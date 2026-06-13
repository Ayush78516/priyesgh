// function Committee() {
//   const committees = [
//     {
//       icon: "👥",
//       title: "Membership Committee",
//       members: [
//         { name: "Elakkiya D", role: "Member" },
//         { name: "Gurbinder Singh", role: "Member" },
//         { name: "Simul Sarkar", role: "Member" },
//         { name: "Sudhir Kumar Singh", role: "Member" },
//       ],
//     },
//     {
//       icon: "⚖️",
//       title: "Disciplinary Committee",
//       members: [
//         { name: "Babu G", role: "Member" },
//         { name: "Siddant Arora", role: "Member" },
//         { name: "Chaitanya K Srivastava", role: "Member" },
//         { name: "Bhimrao Jaligama", role: "Member" },
//       ],
//     },
//   ];

//   return (
//     <>
//       {/* HERO */}
//       <section className="hero">
//         <h1>Committee Members</h1>
//         <p>Meet the dedicated professionals leading COV's mission</p>
//       </section>

//       {/* MAIN CONTAINER */}
//       <div className="committee-container">
//         {committees.map((committee, i) => (
//           <div className="committee-section" key={i}>
//             <div className="committee-header">
//               <div className="committee-icon">{committee.icon}</div>
//               <h2>{committee.title}</h2>
//             </div>
//             <div className="members-grid">
//               {committee.members.map((member, j) => (
//                 <div className="member-card" key={j}>
//                   <div className="member-name">{member.name}</div>
//                   <div className="member-role">{member.role}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }

// export default Committee;

import { useEffect, useState } from "react";

// Default committees — shown until admin customises via CMS
const DEFAULT_COMMITTEES = [
  {
    id: "com_1",
    icon: "👥",
    title: "Membership Committee",
    members: [
      { id: "m1", name: "Elakkiya D", role: "Member" },
      { id: "m2", name: "Gurbinder Singh", role: "Member" },
      { id: "m3", name: "Simul Sarkar", role: "Member" },
      { id: "m4", name: "Sudhir Kumar Singh", role: "Member" },
    ],
  },
  {
    id: "com_2",
    icon: "⚖️",
    title: "Disciplinary Committee",
    members: [
      { id: "m5", name: "Babu G", role: "Member" },
      { id: "m6", name: "Siddant Arora", role: "Member" },
      { id: "m7", name: "Chaitanya K Srivastava", role: "Member" },
      { id: "m8", name: "Bhimrao Jaligama", role: "Member" },
    ],
  },
];

function Committee() {
  // Starts with hardcoded data; replaced by CMS data if admin has customised it
  const [committees, setCommittees] = useState(DEFAULT_COMMITTEES);

  useEffect(() => {
    const loadFromCMS = async () => {
      try {
        const res = await fetch(`/api/public/cms?t=${Date.now()}`);
        const data = await res.json();
        if (!data.success) return;
        const item = data.data.find(
          (i) => i.key === "committee_data" && i.value && i.value !== "__deleted__"
        );
        if (item) {
          const parsed = JSON.parse(item.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCommittees(parsed);
          }
        }
        // No CMS entry → keep DEFAULT_COMMITTEES unchanged
      } catch {
        // On error → keep DEFAULT_COMMITTEES
      }
    };
    loadFromCMS();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>Committee Members</h1>
        <p>Meet the dedicated professionals leading COV's mission</p>
      </section>

      {/* MAIN CONTAINER */}
      <div className="committee-container">
        {committees.map((committee) => (
          <div className="committee-section" key={committee.id}>
            <div className="committee-header">
              <div className="committee-icon">{committee.icon}</div>
              <h2>{committee.title}</h2>
            </div>
            <div className="members-grid">
              {committee.members.map((member) => (
                <div className="member-card" key={member.id}>
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Committee;