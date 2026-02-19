document.addEventListener("DOMContentLoaded", () => {

    /* ---------- DOM REFERENCES ---------- */
    const passArea = document.getElementById("passProcessingArea");
    const resultDiv = document.getElementById("output");
    const inputNumbers = document.getElementById("inputNumbers");
    const countInput = document.getElementById("count");
    const randomBtn = document.getElementById("randomBtn");
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const autoRunBtn = document.getElementById("autoRunBtn");
let renderedPasses = new Set();
let isSortedComplete = false;

    let steps = [];
    let currentStep = 0;
    let autoRunInterval = null;
    let isAutoRunning = false;

    /* ---------- HELPER: PAD NUMBER WITH ZEROS ---------- */
    function padNumber(num, maxDigits) {
        return num.toString().padStart(maxDigits, "0");
    }

    /* ---------- RANDOM INPUT ---------- */
    randomBtn.addEventListener("click", () => {
        const count = parseInt(countInput.value) || 8;
        const arr = Array.from({ length: count }, () =>
            Math.floor(Math.random() * 1000)
        );
        inputNumbers.value = arr.join(",");
    });


/* ---------- START ---------- */
startBtn.addEventListener("click", () => {
    const nums = validateInput();
    if (!nums) return; // ❌ Stop if invalid

    // ✅ Safe to proceed
    steps = radixSortSteps(nums);
    currentStep = 0;

    passArea.innerHTML = "";
    resultDiv.innerHTML = "";
    renderedPasses.clear();
    isSortedComplete = false;

    showStep();
});
document.getElementById("inputNumbers").addEventListener("input", () => {
    const nums = document
        .getElementById("inputNumbers")
        .value
        .split(",")
        .map(n => n.trim())
        .filter(n => n !== "");

    document.getElementById("count").value = nums.length;
});


   /* ---------- RESET ---------- */
resetBtn.addEventListener("click", () => {
    stopAutoRun();
    currentStep = 0;
    steps = [];
    passArea.innerHTML = "";
    resultDiv.innerHTML = "";
    // No need for dataset anymore
});
    /* ---------- NAVIGATION ---------- */
    nextBtn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep();
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep();
        }
    });

    /* ---------- AUTO RUN ---------- */
    autoRunBtn.addEventListener("click", () => {
        if (isAutoRunning) {
            stopAutoRun();
        } else {
            startAutoRun();
        }
    });

    
    function startAutoRun() {
    if (steps.length === 0) {
        alert("Please click 'Start' first!");
        return;
    }

    isAutoRunning = true;
    autoRunBtn.textContent = "⏸ Pause";
    autoRunBtn.style.background = "#dc2626";

    const speed = 1500; // Fixed speed: 1.5 seconds per step
    
    autoRunInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep();
        } else {
            stopAutoRun();
        }
    }, speed);
}

    function stopAutoRun() {
        isAutoRunning = false;
        autoRunBtn.textContent = "▶ Auto Run";
        autoRunBtn.style.background = "#16a34a";
        
        if (autoRunInterval) {
            clearInterval(autoRunInterval);
            autoRunInterval = null;
        }
    }

    
    /* ---------- RADIX SORT STEPS ---------- */
    function radixSortSteps(arr) {
        let steps = [];
        let maxDigits = Math.max(...arr.map(n => n.toString().length));
        let current = [...arr];

        for (let d = 0; d < maxDigits; d++) {
            // Step 1: Show creating buckets
            steps.push({
                digitIndex: d,
                array: [...current],
                buckets: null,
                substep: 'create',
                maxDigits: maxDigits
            });

            let buckets = Array.from({ length: 10 }, () => []);

            current.forEach(num => {
                let digit = Math.floor(num / Math.pow(10, d)) % 10;
                buckets[digit].push(num);
            });

            // Step 2: Show distribution into buckets
            steps.push({
                digitIndex: d,
                array: [...current],
                buckets: buckets,
                substep: 'distribute',
                maxDigits: maxDigits
            });

            current = [].concat(...buckets);
            
            // Step 3: Show collection from buckets
            steps.push({
                digitIndex: d,
                array: [...current],
                buckets: buckets,
                substep: 'collect',
                maxDigits: maxDigits
            });
        }

        steps.push({
            digitIndex: -1,
            array: [...current],
            buckets: null,
            maxDigits: maxDigits
        });

        return steps;
    }

    /* ---------- GET PSEUDOCODE WITH HIGHLIGHTING ---------- */
    function getPseudocodeHTML(step) {
        const lines = [
            { code: "for digit = 0 to maxDigits - 1:", highlight: false },
            { code: "    create 10 empty buckets (0-9)", highlight: false },
            { code: "    for each number in array:", highlight: false },
            { code: "        digitValue = (number / 10^digit) mod 10", highlight: false },
            { code: "        insert number into bucket[digitValue]", highlight: false },
            { code: "    collect numbers from buckets 0 to 9", highlight: false }
        ];

        if (step.digitIndex === -1) {
            lines.forEach(line => line.highlight = false);
        } else {
            const substep = step.substep || 'create';
            
            switch(substep) {
                case 'create':
                    lines[0].highlight = true;
                    lines[1].highlight = true;
                    break;
                case 'distribute':
                    lines[2].highlight = true;
                    lines[3].highlight = true;
                    lines[4].highlight = true;
                    break;
                case 'collect':
                    lines[5].highlight = true;
                    break;
            }
        }

        return lines.map(line => {
            const className = line.highlight ? 'pseudo-line pseudo-highlight' : 'pseudo-line';
            return `<div class="${className}">${line.code}</div>`;
        }).join('');
    }

    /* ---------- DISPLAY CURRENT STEP ---------- */
    /* ---------- DISPLAY CURRENT STEP ---------- */
function showStep() {
    passArea.innerHTML = "";

    const step = steps[currentStep];
    const digitIndex = step.digitIndex;
    const maxDigits = step.maxDigits;

    /* -------- PASS TITLE -------- */
    let passTitle = "";
    if (digitIndex === -1) {
        passTitle = "✓ Sorted Complete";
    } else {
        const ordinal = ["1st", "2nd", "3rd"];
        const digitName = digitIndex < 3 ? ordinal[digitIndex] : `${digitIndex + 1}th`;
        const substepName = step.substep === 'create' ? 'Creating Buckets' : 
                           step.substep === 'distribute' ? 'Distributing Numbers' : 
                           'Collecting Results';
        passTitle = `Pass ${digitIndex + 1} - ${substepName} (${digitName} digit: 10<sup>${digitIndex}</sup>)`;
    }

    /* -------- UPDATE PSEUDOCODE IN INPUT PANEL -------- */
    const pseudocodeContainer = document.getElementById("pseudocodeContainer");
    if (pseudocodeContainer) {
        pseudocodeContainer.innerHTML = getPseudocodeHTML(step);
    }

    /* -------- NUMBERS + ARROW ABOVE DIGIT -------- */
    const numbersHTML = step.array.map(num => {
        const padded = padNumber(num, maxDigits);
        const originalLength = String(num).length;

        const digitHTML = padded.split("").map((d, i) => {
            const posFromRight = padded.length - 1 - i;
            const isPaddingZero = d === "0" && i < padded.length - originalLength;

            return `
                <span class="digit ${isPaddingZero ? "zero" : ""}">
                    ${posFromRight === digitIndex ? `<span class="arrow">▼</span>` : ""}
                    ${d}
                </span>
            `;
        }).join("");

        return `<div class="number-box">${digitHTML}</div>`;
    }).join("");

    const block = document.createElement("div");
    block.innerHTML = `
        <b style="display: block; margin-top: 20px;">${passTitle}</b>
        <div class="number-row">${numbersHTML}</div>
        <div class="bucket-grid"></div>
    `;

    passArea.appendChild(block);

    /* -------- BUCKETS IN GRID FORMAT -------- */
   /* -------- BUCKETS IN GRID FORMAT -------- */
const bucketGrid = block.querySelector(".bucket-grid");

// Show buckets for distribute/collect steps OR for final sorted step (show last pass buckets)
if (step.buckets && step.substep !== 'create') {
    for (let i = 0; i < 10; i++) {
        const bucket = step.buckets[i];
        const bucketDiv = document.createElement("div");
        bucketDiv.className = "bucket-cell";

        let bucketContentHTML = "";

        if (bucket.length === 0) {
            bucketContentHTML = "-";
        } else {
            bucketContentHTML = bucket
                .map(num => `<div class="bucket-item">${padNumber(num, maxDigits)}</div>`)
                .join("");
        }

        bucketDiv.innerHTML = `
            <div class="bucket-header">Bucket ${i}</div>
            <div class="bucket-content">${bucketContentHTML}</div>
        `;

        bucketGrid.appendChild(bucketDiv);
    }
} else if (digitIndex === -1 && currentStep > 0) {
    // For sorted complete, show the buckets from the last collect step
    const lastCollectStep = steps.slice(0, currentStep).reverse().find(s => s.substep === 'collect');
    
    if (lastCollectStep && lastCollectStep.buckets) {
        for (let i = 0; i < 10; i++) {
            const bucket = lastCollectStep.buckets[i];
            const bucketDiv = document.createElement("div");
            bucketDiv.className = "bucket-cell";

            let bucketContentHTML = "";

            if (bucket.length === 0) {
                bucketContentHTML = "-";
            } else {
                bucketContentHTML = bucket
                    .map(num => `<div class="bucket-item">${padNumber(num, maxDigits)}</div>`)
                    .join("");
            }

            bucketDiv.innerHTML = `
                <div class="bucket-header">Bucket ${i}</div>
                <div class="bucket-content">${bucketContentHTML}</div>
            `;

            bucketGrid.appendChild(bucketDiv);
        }
    }
}
    /* -------- RESULT HISTORY - ONLY LOG ONCE PER PASS -------- */
    // Check if this exact step has already been logged
    /* -------- RESULT HISTORY - REBUILD FROM SCRATCH -------- */
// Only update results when on a "collect" step or final step
if (step.substep === 'collect' || digitIndex === -1) {
    // Clear and rebuild the entire result panel
    resultDiv.innerHTML = "";
    
    // Find all "collect" steps up to current step
    const collectSteps = [];
    for (let i = 0; i <= currentStep; i++) {
        const s = steps[i];
        if (s.substep === 'collect' || s.digitIndex === -1) {
            collectSteps.push(s);
        }
    }
    
    // Remove duplicates by digit index
    const uniqueSteps = [];
    const seenDigits = new Set();
    
    for (const s of collectSteps) {
        const key = s.digitIndex === -1 ? 'complete' : s.digitIndex;
        if (!seenDigits.has(key)) {
            seenDigits.add(key);
            uniqueSteps.push(s);
        }
    }
    
    // Display each unique step
    uniqueSteps.forEach(s => {
        const entry = document.createElement("div");
        const displayTitle = s.digitIndex === -1 ? "✓ Sorted Complete" : `Pass ${s.digitIndex + 1}`;

        let paddedResult;
        
        if (s.digitIndex === -1) {
            // Final result - no highlighting
            paddedResult = s.array
                .map(num => padNumber(num, maxDigits))
                .join(", ");
        } else {
            // Highlight the digit that was processed in this pass
            paddedResult = s.array
                .map(num => {
                    const padded = padNumber(num, maxDigits);
                    const digits = padded.split("");
                    
                    return digits.map((d, i) => {
                        const posFromRight = digits.length - 1 - i;
                        if (posFromRight === s.digitIndex) {
                            return `<span class="highlight-digit">${d}</span>`;
                        }
                        return d;
                    }).join("");
                })
                .join(", ");
        }

        entry.innerHTML = `<b>${displayTitle}:</b> ${paddedResult}`;
        resultDiv.appendChild(entry);
    });
}
    }
});
function validateInput() {
    const numbersField = document.getElementById("inputNumbers");
    const countField = document.getElementById("count");

    const rawInput = numbersField.value.trim();
    const countValue = countField.value.trim();

    /* ---------- EMPTY INPUT ---------- */
    if (rawInput === "") {
        alert(" Please enter numbers.");
        return null;
    }

    /* ---------- LAST CHARACTER CHECK ---------- */
    if (!/[0-9]$/.test(rawInput)) {
        alert(" Input must end with a number.\nRemove trailing commas or invalid characters.");
        return null;
    }

    /* ---------- INVALID CHARACTER CHECK ---------- */
    // Allow ONLY digits and commas
    if (!/^[0-9,]+$/.test(rawInput)) {
        alert(" Invalid character detected.\nOnly digits (0–9) and commas are allowed.");
        return null;
    }

    /* ---------- SPLIT & CLEAN ---------- */
    const parts = rawInput.split(",");

    // Detect empty values like 12,,34
    if (parts.some(p => p === "")) {
        alert(" Empty value detected.\nPlease remove extra commas.");
        return null;
    }

    /* ---------- COUNT VALIDATION ---------- */
    const expectedCount = parseInt(countValue, 10);

    if (isNaN(expectedCount) || expectedCount <= 0) {
        alert(" Total count must be a positive number.");
        return null;
    }

    if (parts.length !== expectedCount) {
        alert(
            ` Count mismatch!\n` +
            `You entered ${parts.length} numbers but count is ${expectedCount}.`
        );
        return null;
    }

    /* ---------- NUMBER VALIDATION ---------- */
    const numbers = [];

    for (let i = 0; i < parts.length; i++) {
        const value = parts[i];

        // Leading zeros allowed (needed for visualization)
        const num = Number(value);

        if (!Number.isInteger(num) || num < 0) {
            alert(` Invalid number at position ${i + 1}: "${value}"`);
            return null;
        }

        numbers.push(num);
    }

    /* ---------- SAFE LIMIT ---------- */
    if (numbers.length > 20) {
        alert(" Please limit input to 20 numbers for smooth visualization.");
        return null;
    }

    return numbers;
}
//Your JavaScript goes in here

