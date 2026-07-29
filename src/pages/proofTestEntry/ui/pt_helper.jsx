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
        //-------------------------
        // Even with short balance, check for flaws in remaining section
        //-------------------------
        if (Array.isArray(ptFlaws) && ptFlaws.length > 0) {
            const GOOD_LENGTH = 2.1;
            const activeFlaws = ptFlaws
                .filter(f => !f.is_done)
                .sort((a, b) => Number(a.pos1) - Number(b.pos1));

            const remainingEnd = done + balance;

            for (const flaw of activeFlaws) {
                const pos1 = Number(flaw.pos1);
                const pos2 = Number(flaw.pos2);

                if (pos1 > done && pos1 <= remainingEnd) {
                    const safeLength = Number((pos1 - done).toFixed(3));

                    // If safe length before flaw < GOOD_LENGTH, suggest (pos2 + 0.100 - done) as relative cut length
                    if (safeLength < GOOD_LENGTH) {
                        const suggestedCut = Number((pos2 + 0.100 - done).toFixed(3));
                        return {
                            hit: true,
                            type: "FLAW",
                            suggestedLength: suggestedCut,
                            flaw,
                            message:
                                `Flaw "${flaw.reason}" found at ${pos1} km.\nNext cut before flaw is only ${safeLength} km (< ${GOOD_LENGTH} km good length).\nBalance: ${balance.toFixed(3)} km remaining.\n\nPlease set length ${suggestedCut} km.`,
                            nextFlawMessage: null
                        };
                    }

                    return {
                        hit: true,
                        type: "FLAW",
                        suggestedLength: safeLength,
                        flaw,
                        message:
                            `Flaw "${flaw.reason}" found at ${pos1} km.\nBalance: ${balance.toFixed(3)} km remaining.\n\nPlease set PT Length to ${safeLength} km.`,
                        nextFlawMessage: null
                    };
                }
            }
        }

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

        const GOOD_LENGTH = 2.1; // km — minimum usable length

        const activeFlaws = ptFlaws
            .filter(f => !f.is_done)
            .sort((a, b) => Number(a.pos1) - Number(b.pos1));

        // Check if any flaw lies within current PT window
        for (const flaw of activeFlaws) {

            const pos1 = Number(flaw.pos1);
            const pos2 = Number(flaw.pos2);

            if (pos1 > done && pos1 <= runEnd) {

                const safeLength = Number((pos1 - done).toFixed(3));

                // If the safe length before flaw is less than GOOD_LENGTH,
                // suggest (pos2 + 0.100 - done) as relative cut length from current position
                if (safeLength < GOOD_LENGTH) {
                    const suggestedCut = Number((pos2 + 0.100 - done).toFixed(3));
                    return {
                        hit: true,
                        type: "FLAW",
                        suggestedLength: suggestedCut,
                        flaw,
                        message:
                            `Flaw "${flaw.reason}" found at ${pos1} km.\nNext cut before flaw is only ${safeLength} km (< ${GOOD_LENGTH} km good length).\n\nPlease set length ${suggestedCut} km.`,
                        nextFlawMessage: null
                    };
                }

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

/* ══════════════════════════════════════════════════════════
   FLAW STATUS MANAGEMENT
   ══════════════════════════════════════════════════════════ */

const GOOD_LENGTH_FLAW = 2.1; // km — booking window

/**
 * Compute the status of a single flaw based on current PT progress.
 * 
 * Status Rules:
 *   BOOKED  — flaw.is_done === true (already booked via rejection)
 *   MISSED  — PT Done > (pos1 + GOOD_LENGTH) and not booked
 *   PENDING — not booked and PT Done has not crossed booking window
 */
export const getFlawStatus = (flaw, ptDoneSoFar) => {
    if (flaw.is_done) return 'BOOKED';
    const pos1 = Number(flaw.pos1) || 0;
    const windowEnd = pos1 + GOOD_LENGTH_FLAW;
    if (ptDoneSoFar > windowEnd) return 'MISSED';
    return 'PENDING';
};

/**
 * Compute statuses for all flaws. Returns enriched flaw array with `status` field.
 */
export const computeFlawStatuses = (ptFlaws, ptDoneSoFar) => {
    if (!Array.isArray(ptFlaws)) return [];
    const done = Number(ptDoneSoFar) || 0;
    return ptFlaws
        .slice()
        .sort((a, b) => Number(a.pos1) - Number(b.pos1))
        .map(flaw => ({
            ...flaw,
            status: getFlawStatus(flaw, done),
        }));
};

/**
 * Find the nearest PENDING flaw that is within the booking window.
 * Returns the flaw object or null.
 */
export const findBookableFlaw = (ptFlaws, ptDoneSoFar) => {
    if (!Array.isArray(ptFlaws)) return null;
    const done = Number(ptDoneSoFar) || 0;

    const sorted = ptFlaws
        .slice()
        .sort((a, b) => Number(a.pos1) - Number(b.pos1));

    for (const flaw of sorted) {
        const status = getFlawStatus(flaw, done);
        if (status === 'BOOKED' || status === 'MISSED') continue;

        // PENDING flaw found — check if within booking window
        const pos1 = Number(flaw.pos1) || 0;
        const difference = pos1 - done;

        if (difference <= GOOD_LENGTH_FLAW) {
            return flaw;
        }

        // First pending flaw is too far away
        return null;
    }

    return null;
};

/**
 * Validate if rejection booking is allowed.
 * Returns { allowed: boolean, message: string, flaw: object|null }
 */
export const validateFlawBooking = (ptFlaws, ptDoneSoFar) => {
    if (!Array.isArray(ptFlaws) || ptFlaws.length === 0) {
        return { allowed: true, message: '', flaw: null };
    }

    const done = Number(ptDoneSoFar) || 0;
    const bookable = findBookableFlaw(ptFlaws, done);

    if (bookable) {
        return { allowed: true, message: '', flaw: bookable };
    }

    // Check if there are any pending flaws at all
    const sorted = ptFlaws
        .slice()
        .sort((a, b) => Number(a.pos1) - Number(b.pos1));

    const nextPending = sorted.find(f => getFlawStatus(f, done) === 'PENDING');

    if (nextPending) {
        const pos1 = Number(nextPending.pos1) || 0;
        const diff = (pos1 - done).toFixed(3);
        return {
            allowed: false,
            message: `Cannot book rejection. Next flaw at ${pos1} km (${diff} km away) has not entered the booking range (${GOOD_LENGTH_FLAW} km).`,
            flaw: null
        };
    }

    // All flaws are BOOKED or MISSED — allow normal rejection without flaw booking
    return { allowed: true, message: '', flaw: null };
};

/**
 * Get all flaws that should be marked as MISSED (for backend sync).
 * Unbooked flaws where ptDone > pos1 + GOOD_LENGTH.
 */
export const getMissedFlaws = (ptFlaws, ptDoneSoFar) => {
    if (!Array.isArray(ptFlaws)) return [];
    const done = Number(ptDoneSoFar) || 0;
    return ptFlaws.filter(flaw => {
        if (flaw.is_done) return false;
        const pos1 = Number(flaw.pos1) || 0;
        return done > (pos1 + GOOD_LENGTH_FLAW);
    });
};
