// Controls UI System
// Handles controls display, rebinding UI, and user interactions

// Global state for rebinding
let rebindingAction = null;

// Update controls display in the menu
function updateControlsDisplay() {
    const controlsList = document.getElementById('controlsList');
    if (!controlsList) return;

    controlsList.innerHTML = '';

    // Get controls configuration
    const controls = getControls();
    const buttonNames = getButtonNames();

    // Разделяне на контролите на две групи
    const basicActions = [
        { key: 'left', label: 'Move Left' },
        { key: 'right', label: 'Move Right' },
        { key: 'up', label: 'Move Up (Z+)' },
        { key: 'down', label: 'Move Down (Z-)' },
        { key: 'jump', label: 'Jump' }
    ];

    const attackActions = [
        { key: 'basicAttackLight', label: 'Basic Attack Light' },
        { key: 'basicAttackMedium', label: 'Basic Attack Medium' },
        { key: 'basicAttackHeavy', label: 'Basic Attack Heavy' },
        { key: 'secondaryAttackLight', label: 'Secondary Attack Light' },
        { key: 'secondaryAttackMedium', label: 'Secondary Attack Medium' },
        { key: 'secondaryAttackHeavy', label: 'Secondary Attack Heavy' }
    ];

    // Лява таблица - основни контроли
    const leftContainer = document.createElement('div');
    leftContainer.style.position = 'absolute';
    leftContainer.style.left = '20px';
    leftContainer.style.top = '80px';
    leftContainer.style.width = '45%';

    const leftTitle = document.createElement('h3');
    leftTitle.textContent = 'Movement Controls';
    leftTitle.style.color = '#fff';
    leftTitle.style.marginBottom = '10px';
    leftContainer.appendChild(leftTitle);

    const leftTable = createControlsTable(basicActions, controls, buttonNames, true); // true = include input mode
    leftContainer.appendChild(leftTable);

    // Дясна таблица - атаки
    const rightContainer = document.createElement('div');
    rightContainer.style.position = 'absolute';
    rightContainer.style.right = '20px';
    rightContainer.style.top = '80px';
    rightContainer.style.width = '50%';

    const rightTitle = document.createElement('h3');
    rightTitle.textContent = 'Attack Controls';
    rightTitle.style.color = '#fff';
    rightTitle.style.marginBottom = '10px';
    rightContainer.appendChild(rightTitle);

    const rightTable = createControlsTable(attackActions, controls, buttonNames, false); // false = no input mode
    rightContainer.appendChild(rightTable);

    controlsList.appendChild(leftContainer);
    controlsList.appendChild(rightContainer);
}

// Create controls table
function createControlsTable(actions, controls, buttonNames, includeInputMode) {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.background = '#222';
    table.style.border = '2px solid #444';

    // Header row
    const headerRow = document.createElement('tr');
    const actionHeader = document.createElement('th');
    actionHeader.textContent = 'Action';
    actionHeader.style.padding = '8px';
    actionHeader.style.border = '1px solid #444';
    actionHeader.style.color = '#fff';
    actionHeader.style.background = '#333';
    headerRow.appendChild(actionHeader);

    // Player columns (only first 2 players for compact menu)
    for (let i = 1; i <= 2; i++) {
        const playerHeader = document.createElement('th');
        playerHeader.textContent = `Player ${i}`;
        playerHeader.style.padding = '8px';
        playerHeader.style.border = '1px solid #444';
        playerHeader.style.color = '#fff';
        playerHeader.style.background = '#333';
        headerRow.appendChild(playerHeader);
    }

    table.appendChild(headerRow);

    // Input Mode row (only for left table)
    if (includeInputMode) {
        const inputModeRow = document.createElement('tr');
        const inputModeLabel = document.createElement('td');
        inputModeLabel.textContent = 'Input Mode';
        inputModeLabel.style.padding = '6px';
        inputModeLabel.style.border = '1px solid #444';
        inputModeLabel.style.color = '#fff';
        inputModeLabel.style.fontWeight = 'bold';
        inputModeLabel.style.background = '#2a2a2a';
        inputModeRow.appendChild(inputModeLabel);

        for (let i = 1; i <= 2; i++) {
            const player = `player${i}`;
            const inputModeCell = document.createElement('td');
            inputModeCell.style.padding = '6px';
            inputModeCell.style.border = '1px solid #444';
            inputModeCell.style.textAlign = 'center';
            inputModeCell.style.background = '#2a2a2a';

            if (controls[player]) {
                const select = document.createElement('select');
                select.style.background = '#444';
                select.style.color = '#fff';
                select.style.border = '1px solid #666';
                select.style.fontSize = '12px';
                select.style.padding = '2px';

                const keyboardOption = document.createElement('option');
                keyboardOption.value = 'keyboard';
                keyboardOption.textContent = 'Keyboard';
                select.appendChild(keyboardOption);

                const controllerOption = document.createElement('option');
                controllerOption.value = 'controller';
                controllerOption.textContent = 'Controller';
                select.appendChild(controllerOption);

                select.value = controls[player].inputMode || 'keyboard';
                select.onchange = () => {
                    setPlayerInputMode(player, select.value);
                    updateControlsDisplay(); // Refresh display
                };

                inputModeCell.appendChild(select);
            } else {
                inputModeCell.textContent = 'N/A';
                inputModeCell.style.color = '#666';
            }

            inputModeRow.appendChild(inputModeCell);
        }

        table.appendChild(inputModeRow);
    }

    // Action rows
    actions.forEach(action => {
        const row = document.createElement('tr');

        // Action label
        const actionCell = document.createElement('td');
        actionCell.textContent = action.label;
        actionCell.style.padding = '6px';
        actionCell.style.border = '1px solid #444';
        actionCell.style.color = '#fff';
        actionCell.style.fontSize = '12px';
        row.appendChild(actionCell);

        // Player control cells
        for (let i = 1; i <= 2; i++) {
            const player = `player${i}`;
            const controlCell = document.createElement('td');
            controlCell.style.padding = '6px';
            controlCell.style.border = '1px solid #444';
            controlCell.style.textAlign = 'center';

            if (controls[player]) {
                // Get current input mode
                const inputMode = controls[player].inputMode || 'keyboard';
                const currentControls = controls[player][inputMode];

                // Get the current key/button for this action
                let displayText = 'N/A';
                if (currentControls && currentControls[action.key] !== undefined) {
                    if (inputMode === 'keyboard') {
                        displayText = currentControls[action.key];
                    } else if (inputMode === 'controller') {
                        // Convert button number to readable name
                        const buttonNumber = currentControls[action.key];
                        displayText = buttonNames[buttonNumber] || `Button ${buttonNumber}`;
                    }
                }

                const keySpan = document.createElement('span');
                keySpan.id = `key-${player}-${action.key}`;
                keySpan.className = rebindingAction === `${player}-${action.key}` ? 'rebinding' : '';
                keySpan.textContent = displayText;
                keySpan.style.marginRight = '5px';
                keySpan.style.color = rebindingAction === `${player}-${action.key}` ? 'yellow' : '#fff';
                keySpan.style.fontSize = '11px';

                const changeBtn = document.createElement('button');
                changeBtn.textContent = 'Change';
                changeBtn.setAttribute('onclick', `window.startRebinding('${player}', '${action.key}')`);
                changeBtn.style.fontSize = '10px';
                changeBtn.style.padding = '2px 4px';

                controlCell.appendChild(keySpan);
                controlCell.appendChild(changeBtn);
            } else {
                controlCell.textContent = 'N/A';
                controlCell.style.color = '#666';
                controlCell.style.fontSize = '11px';
            }

            row.appendChild(controlCell);
        }

        table.appendChild(row);
    });

    return table;
}

// Start rebinding process for a control
function startRebinding(player, action) {
    rebindingAction = `${player}-${action}`;
    updateControlsDisplay();

    const handler = (e) => {
        e.preventDefault();

        // Get current input mode
        const controls = getControls();
        const inputMode = controls[player].inputMode || 'keyboard';

        // Update the control binding
        updateControlBinding(player, inputMode, action, e.key);

        rebindingAction = null;
        updateControlsDisplay();
        document.removeEventListener('keydown', handler);
    };

    document.addEventListener('keydown', handler);
}

// Show controls menu (called from menu core)
function showControlsMenu() {
    // This function is called from menu_core.js
    // The actual menu switching is handled there
    updateControlsDisplay();
}

// Global exports for backward compatibility
window.ControlsUI = {
    updateControlsDisplay,
    createControlsTable,
    startRebinding,
    showControlsMenu
};

// Global function for onclick handlers
window.startRebinding = startRebinding;
