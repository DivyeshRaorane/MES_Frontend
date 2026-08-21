import * as XLSX from "xlsx";

// export const drawFlawAutomation = (rows) => {
//     const results = [];

//     let currentStart = null;
//     let flaws = new Set();

//     for (const row of rows) {

//         const msg = row.Message;

        

//         // Ignore unwanted messages
//         if (
//             msg.startsWith("Message not defined") ||
//             msg.startsWith("Acknowledged alarm")
//         ) {
//             continue;
//         }

//         // Fast Layer Start
//         if (msg.includes("Fast Layer Start")) {

//             if (currentStart === null) {
//                 const match = msg.match(/@\s*([\d.]+)/);

//                 if (match) {
//                     currentStart = parseFloat(match[1]);
//                 }

//                 flaws.clear();
//             }

//             continue;
//         }

//         // Fast Layer Stop
//         if (msg.includes("Fast Layer Stop")) {

//             if (currentStart !== null) {

//                 const match = msg.match(/@\s*([\d.]+)/);

//                 results.push({
//                     start_length: currentStart,
//                     end_length: match ? parseFloat(match[1]) : null,
//                     flaw_desc: [...flaws].join(", ")
//                 });

//                 currentStart = null;
//                 flaws.clear();
//             }

//             continue;
//         }

//         // Fibre Break
//         //if (msg.includes("Fibre Break")) {
// //
//         //    const match = msg.match(/@\s*([\d.]+)/);
// //
//         //    results.push({
//         //        drawn_length: match ? parseFloat(match[1]) : null
//         //    });
// //
//         //    currentStart = null;
//         //    flaws.clear();
// //
//         //    continue;
//         //}

//         // Collect flaws only inside active block
//         if (currentStart !== null) {

//             let flaw = msg.split("@")[0].trim();
//             flaw = flaw.replace(/\.$/, "");
//             flaws.add(flaw);
//         }
//     }
//     return results;
// };



export const drawFlawAutomation = (rows) => {
 const results = [];

 let inFastLayer = false;
 let ignoreStops = false;

 let pos1 = null;
 let reason = "";

 let totalKm = null;
 let goodFiberKm = []; // stores every "Good Fiber @xx.x" value found, in order


 for (const row of rows) {

 const msg = row.Message;
 console.log("rows:", msg)

 // Ignore unwanted messages
 if (
 msg.startsWith("Message not defined") ||
 msg.startsWith("Acknowledged alarm")
 ) {
 continue;
 }


 // ----------------------------
    // Good Fiber
    // ----------------------------
    if (msg.includes("Good fibre start")) {

      const match = msg.match(/@\s*([\d.]+)/);

      if (match) {
        const goodValue = parseFloat(match[1]);
        goodFiberKm.push(goodValue);

        results.push({
          pos1: 0,
          pos2: goodValue,
          defect_length: (goodValue - 0),
          actual_cutting: (goodValue - 0) + 0.100,
          reason: "BE"
        });
      }

      continue;
    }


 // ----------------------------
 // Tower Fibre Break
 // ----------------------------
 if (msg.includes("TowerFibre Break")) {

 const match = msg.match(/@\s*([\d.]+)/);

 if (match) {
 totalKm = parseFloat(match[1]);
 }

 // Stop processing after first Tower Fibre Break
 break;
 }

 // ----------------------------
 // Fast Layer Start
 // ----------------------------
 if (msg.includes("Fast Layer Start")) {

 // Ignore duplicate Starts
 if (!inFastLayer) {

 const match = msg.match(/@\s*([\d.]+)/);

 if (match) {
 pos1 = parseFloat(match[1]);
 inFastLayer = true;
 ignoreStops = false;
 reason = "";
 }
 }

 continue;
 }

 // ----------------------------
 // Fast Layer Stop
 // ----------------------------
 if (msg.includes("Fast Layer Stop")) {

 // Ignore duplicate Stops
 if (ignoreStops) {
 continue;
 }

 if (inFastLayer) {

 const match = msg.match(/@\s*([\d.]+)/);

 results.push({
 pos1,
 pos2: match ? parseFloat(match[1]) : null,
 defect_length: ((match ? parseFloat(match[1]) : null) - pos1),
 actual_cutting: ((match ? parseFloat(match[1]) : null) - pos1) + 0.100,
 reason
 });

 inFastLayer = false;
 ignoreStops = true;
 pos1 = null;
 reason = "";
 }

 continue;
 }

 // ----------------------------
 // First Defect only
 // ----------------------------
 if (inFastLayer && reason === "") {

 if (msg.includes("Bare fibre diameter")) {
 reason = "BFD";
 }
 else if (msg.includes("Coated fibre diameter")) {
 reason = "CD2";
 }
 else if (msg.includes("Lump")) {
 reason = "Lumps";
 }
 }
 }

 console.log("========== Flaw Report ==========");
 console.table(results);
 

 return {
 results,
 totalKm,
 goodFiberKm
 };
 };



export const reverseFlawPositions = (totalKm, results, goodLength = 2.1) => {
    const reversed = results
        .map(item => ({
            ...item,
            pos1: +(totalKm - item.pos2).toFixed(3),
            pos2: +(totalKm - item.pos1).toFixed(3),
        }))
        .sort((a, b) => a.pos1 - b.pos1);

    // Merge consecutive flaws where gap < goodLength
    if (reversed.length <= 1) return reversed;

    const merged = [];
    let current = { ...reversed[0] };

    for (let i = 1; i < reversed.length; i++) {
        const next = reversed[i];
        const gap = next.pos1 - current.pos2;

        if (gap < goodLength) {
            // Extend current group — keep pos1 from first, update pos2 to latest
            current.pos2 = next.pos2;
        } else {
            // Gap too large — finalize current group and start new one
            current.defect_length = +(current.pos2 - current.pos1).toFixed(3);
            current.actual_cutting = +(current.defect_length + 0.1).toFixed(3);
            merged.push(current);
            current = { ...next };
        }
    }

    // Push the last group
    current.defect_length = +(current.pos2 - current.pos1).toFixed(3);
    current.actual_cutting = +(current.defect_length + 0.1).toFixed(3);
    merged.push(current);

    return merged;
};



export const exportFlawReport = (rows) => {
    const data = drawFlawAutomation(rows);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Flaw Report");

    XLSX.writeFile(workbook, "Flaw_Report.xlsx");
};