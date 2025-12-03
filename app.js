/**
 * Fleet Services Tool - Main Application
 * A simple fleet management tool for tracking vehicles
 */

// Fleet data storage
let fleet = [];

// DOM Elements
const vehicleForm = document.getElementById('vehicleForm');
const fleetTableBody = document.getElementById('fleetTableBody');
const filterStatus = document.getElementById('filterStatus');
const emptyMessage = document.getElementById('emptyMessage');

// Stats elements
const totalVehiclesEl = document.getElementById('totalVehicles');
const availableCountEl = document.getElementById('availableCount');
const inUseCountEl = document.getElementById('inUseCount');
const maintenanceCountEl = document.getElementById('maintenanceCount');

// Initialize the application
function init() {
    loadFleetFromStorage();
    renderFleet();
    updateStats();

    // Event listeners
    vehicleForm.addEventListener('submit', handleAddVehicle);
    filterStatus.addEventListener('change', renderFleet);
}

// Load fleet data from localStorage
function loadFleetFromStorage() {
    const savedFleet = localStorage.getItem('fleetData');
    if (savedFleet) {
        fleet = JSON.parse(savedFleet);
    }
}

// Save fleet data to localStorage
function saveFleetToStorage() {
    localStorage.setItem('fleetData', JSON.stringify(fleet));
}

// Handle adding a new vehicle
function handleAddVehicle(e) {
    e.preventDefault();

    const vehicle = {
        id: document.getElementById('vehicleId').value.trim(),
        name: document.getElementById('vehicleName').value.trim(),
        type: document.getElementById('vehicleType').value,
        licensePlate: document.getElementById('licensePlate').value.trim(),
        status: document.getElementById('status').value,
        createdAt: new Date().toISOString()
    };

    // Check for duplicate ID
    if (fleet.some(v => v.id === vehicle.id)) {
        showNotification('Vehicle ID already exists!', 'error');
        return;
    }

    fleet.push(vehicle);
    saveFleetToStorage();
    renderFleet();
    updateStats();
    vehicleForm.reset();
    showNotification('Vehicle added successfully!', 'success');
}

// Render the fleet table
function renderFleet() {
    const filter = filterStatus.value;
    const filteredFleet = filter === 'all' 
        ? fleet 
        : fleet.filter(v => v.status === filter);

    fleetTableBody.innerHTML = '';

    if (filteredFleet.length === 0) {
        emptyMessage.style.display = 'block';
        document.getElementById('fleetTable').style.display = 'none';
        return;
    }

    emptyMessage.style.display = 'none';
    document.getElementById('fleetTable').style.display = 'table';

    filteredFleet.forEach(vehicle => {
        const row = createVehicleRow(vehicle);
        fleetTableBody.appendChild(row);
    });
}

// Create a table row for a vehicle
function createVehicleRow(vehicle) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${escapeHtml(vehicle.id)}</strong></td>
        <td>${escapeHtml(vehicle.name)}</td>
        <td>${getTypeIcon(vehicle.type)} ${capitalize(vehicle.type)}</td>
        <td>${escapeHtml(vehicle.licensePlate)}</td>
        <td><span class="status-badge status-${vehicle.status}">${formatStatus(vehicle.status)}</span></td>
        <td class="actions">
            <button class="btn btn-success" onclick="cycleStatus('${escapeHtml(vehicle.id)}')">Status</button>
            <button class="btn btn-danger" onclick="deleteVehicle('${escapeHtml(vehicle.id)}')">Delete</button>
        </td>
    `;
    return row;
}

// Get vehicle type icon
function getTypeIcon(type) {
    const icons = {
        car: '🚗',
        van: '🚐',
        truck: '🚚',
        motorcycle: '🏍️'
    };
    return icons[type] || '🚗';
}

// Format status for display
function formatStatus(status) {
    const formats = {
        'available': 'Available',
        'in-use': 'In Use',
        'maintenance': 'Maintenance'
    };
    return formats[status] || status;
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cycle through vehicle status
function cycleStatus(vehicleId) {
    const vehicle = fleet.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const statusOrder = ['available', 'in-use', 'maintenance'];
    const currentIndex = statusOrder.indexOf(vehicle.status);
    vehicle.status = statusOrder[(currentIndex + 1) % statusOrder.length];

    saveFleetToStorage();
    renderFleet();
    updateStats();
    showNotification(`Status updated to ${formatStatus(vehicle.status)}`, 'success');
}

// Delete a vehicle
function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    fleet = fleet.filter(v => v.id !== vehicleId);
    saveFleetToStorage();
    renderFleet();
    updateStats();
    showNotification('Vehicle deleted', 'success');
}

// Update statistics
function updateStats() {
    totalVehiclesEl.textContent = fleet.length;
    availableCountEl.textContent = fleet.filter(v => v.status === 'available').length;
    inUseCountEl.textContent = fleet.filter(v => v.status === 'in-use').length;
    maintenanceCountEl.textContent = fleet.filter(v => v.status === 'maintenance').length;
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#2ed573' : '#ff4757'};
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
