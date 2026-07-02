// export const checkPTLength = ({
//     ptDoneLength = 0,
//     standardLength = 50.400,
//     balanceLength = 0,
//     ptFlaws = []
// }) => {

//     const done = Number(ptDoneLength) || 0;
//     const standard = Number(standardLength) || 0;
//     const balance = Number(balanceLength) || 0;

//     //-------------------------
//     // Case 1 : Balance Length
//     //-------------------------

//     if (balance <= 0) {
//         return {
//             hit: true,
//             type: "BALANCE",
//             suggestedLength: 0,
//             flaw: null,
//             message: "No balance length available."
//         };
//     }

//     if (balance < standard) {
//         return {
//             hit: true,
//             type: "BALANCE",
//             suggestedLength: Number(balance.toFixed(3)),
//             flaw: null,
//             message: `Only ${balance.toFixed(3)} km balance remaining.\nPlease set PT Length to ${balance.toFixed(3)} km.`
//         };
//     }

//     //-------------------------
//     // Current PT Window
//     //-------------------------

//     const runEnd = done + standard;

//     //-------------------------
//     // Active Flaw Check
//     //-------------------------

//     if (Array.isArray(ptFlaws)) {

//         for (const flaw of ptFlaws) {

//             if (flaw.is_complete) continue;

//             const pos1 = Number(flaw.pos1);

//             if (pos1 > done && pos1 <= runEnd) {

//                 const safeLength = Number((pos1 - done).toFixed(3));

//                 return {
//                     hit: true,
//                     type: "FLAW",
//                     suggestedLength: safeLength,
//                     flaw,
//                     message:
//                         `Flaw "${flaw.reason}" found at ${pos1} km.\n\nPlease set PT Length to ${safeLength} km.`
//                 };
//             }
//         }
//     }

//     //-------------------------
//     // Safe
//     //-------------------------

//     return {
//         hit: false,
//         type: "STANDARD",
//         suggestedLength: standard,
//         flaw: null,
//         message: null
//     };

// };




export const checkPTLength = ({
    ptDoneLength = 0,
    standardLength = 50.400,
    balanceLength = 0,
    ptFlaws = []
}) => {

    const done = Number(ptDoneLength) || 0;
    const standard = Number(standardLength) || 0;
    const balance = Number(balanceLength) || 0;

    //-------------------------
    // Case 1 : Balance Length
    //-------------------------

    if (balance <= 0) {
        return {
            hit: true,
            type: "BALANCE",
            suggestedLength: 0,
            flaw: null,
            message: "No balance length available.",
            nextFlawMessage: null
        };
    }

    if (balance < standard) {
        return {
            hit: true,
            type: "BALANCE",
            suggestedLength: Number(balance.toFixed(3)),
            flaw: null,
            message: `Only ${balance.toFixed(3)} km balance remaining.\nPlease set PT Length to ${balance.toFixed(3)} km.`,
            nextFlawMessage: null
        };
    }

    //-------------------------
    // Current PT Window
    //-------------------------

    const runEnd = done + standard;

    //-------------------------
    // Active Flaw Check
    //-------------------------

    if (Array.isArray(ptFlaws) && ptFlaws.length > 0) {

        const activeFlaws = ptFlaws
            .filter(f => !f.is_complete)
            .sort((a, b) => Number(a.pos1) - Number(b.pos1));

        // Check if any flaw lies within current PT window
        for (const flaw of activeFlaws) {

            const pos1 = Number(flaw.pos1);

            if (pos1 > done && pos1 <= runEnd) {

                const safeLength = Number((pos1 - done).toFixed(3));

                return {
                    hit: true,
                    type: "FLAW",
                    suggestedLength: safeLength,
                    flaw,
                    message:
                        `Flaw "${flaw.reason}" found at ${pos1} km.\n\nPlease set PT Length to ${safeLength} km.`,
                    nextFlawMessage: null
                };
            }
        }

        //-------------------------
        // Next Upcoming Flaw
        //-------------------------

        const nextFlaw = activeFlaws.find(f => Number(f.pos1) > runEnd);

        if (nextFlaw) {

            const nextDistance = Number(
                (Number(nextFlaw.pos1) - done).toFixed(3)
            );

            return {
                hit: false,
                type: "STANDARD",
                suggestedLength: standard,
                flaw: null,
                message: null,
                nextFlawMessage: `Next flaw is after ${nextDistance.toFixed(3)} km.`
            };
        }
    }

    //-------------------------
    // Safe
    //-------------------------

    return {
        hit: false,
        type: "STANDARD",
        suggestedLength: standard,
        flaw: null,
        message: null,
        nextFlawMessage: null
    };

};
