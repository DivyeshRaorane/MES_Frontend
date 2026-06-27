import * as XLSX from "xlsx";

export const drawFlawAutomation = (rows) => {
    const results = [];

    let currentStart = null;
    let flaws = new Set();

    for (const row of rows) {

        const msg = row.Message;

        

        // Ignore unwanted messages
        if (
            msg.startsWith("Message not defined") ||
            msg.startsWith("Acknowledged alarm")
        ) {
            continue;
        }

        // Fast Layer Start
        if (msg.includes("Fast Layer Start")) {

            if (currentStart === null) {
                const match = msg.match(/@\s*([\d.]+)/);

                if (match) {
                    currentStart = parseFloat(match[1]);
                }

                flaws.clear();
            }

            continue;
        }

        // Fast Layer Stop
        if (msg.includes("Fast Layer Stop")) {

            if (currentStart !== null) {

                const match = msg.match(/@\s*([\d.]+)/);

                results.push({
                    start_length: currentStart,
                    end_length: match ? parseFloat(match[1]) : null,
                    flaw_desc: [...flaws].join(", ")
                });

                currentStart = null;
                flaws.clear();
            }

            continue;
        }

        // Fibre Break
        //if (msg.includes("Fibre Break")) {
//
        //    const match = msg.match(/@\s*([\d.]+)/);
//
        //    results.push({
        //        drawn_length: match ? parseFloat(match[1]) : null
        //    });
//
        //    currentStart = null;
        //    flaws.clear();
//
        //    continue;
        //}

        // Collect flaws only inside active block
        if (currentStart !== null) {

            let flaw = msg.split("@")[0].trim();
            flaw = flaw.replace(/\.$/, "");
            flaws.add(flaw);
        }
    }
    return results;
};

export const exportFlawReport = (rows) => {
    const data = drawFlawAutomation(rows);

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Flaw Report");

    XLSX.writeFile(workbook, "Flaw_Report.xlsx");
};