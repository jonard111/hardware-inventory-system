const STORAGE_KEYS = {
    assets: "hn_assets",
    requests: "hn_requests",
    users: "hn_users",
    session: "hn_session"
};

let currentAssetList = [];

function getStored(key, defaultValue = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

function setStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getAssets() {
    return getStored(STORAGE_KEYS.assets, []);
}

function saveAssets(assets) {
    setStored(STORAGE_KEYS.assets, assets);
}

function getRequests() {
    return getStored(STORAGE_KEYS.requests, []);
}

function saveRequests(requests) {
    setStored(STORAGE_KEYS.requests, requests);
}

function getUsers() {
    return getStored(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    setStored(STORAGE_KEYS.users, users);
}

function getSession() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
}

function saveSession(user) {
    setStored(STORAGE_KEYS.session, user);
}

function initDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.assets)) {
        saveAssets([]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.users)) {
        saveUsers([]);
    }
}

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox) {
        window.alert(message);
        return;
    }

    alertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function hashString(value, bucketCount) {
    return ([...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % bucketCount + bucketCount) % bucketCount;
}

function computeBuckets(assets, bucketCount = 11) {
    const buckets = Array.from({length: bucketCount}, () => []);
    assets.forEach(asset => {
        const index = hashString(asset.assetId || asset.name || "", bucketCount);
        buckets[index].push(asset);
    });
    return buckets;
}

function renderAssetTable(assets) {
    const tableBody = document.getElementById("assetTableBody");
    if (!tableBody) return;

    if (!assets || assets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-muted text-center py-4">No assets found.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = assets.map(asset => `
        <tr>
            <td>${asset.assetId}</td>
            <td>${asset.name}</td>
            <td>${asset.category}</td>
            <td>${asset.quantity}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-danger rounded-pill px-3" onclick="deleteHardware('${asset.assetId}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function renderStaffAssetTable(assets) {
    const tableBody = document.getElementById("staffAssetTableBody");
    if (!tableBody) return;

    if (!assets || assets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-muted text-center py-4">No assets available.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = assets.map(asset => `
        <tr data-category="${asset.category}">
            <td>${asset.assetId}</td>
            <td>${asset.name}</td>
            <td>${asset.category}</td>
            <td>${asset.quantity}</td>
            <td>
                <span class="badge rounded-pill ${asset.quantity > 0 ? "text-bg-success" : "text-bg-danger"}">
                    ${asset.quantity > 0 ? "Available" : "Out of Stock"}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-primary btn-sm rounded-pill px-3" data-id="${asset.assetId}" data-name="${asset.name}" onclick="fillRequestModal(this)" data-bs-toggle="modal" data-bs-target="#requestModal">
                    <i class="bi bi-plus-circle me-1"></i>
                    Request
                </button>
            </td>
        </tr>
    `).join("");
}

function renderRequestHistory(requests) {
    const tableBody = document.getElementById("requestHistoryTableBody");
    if (!tableBody) return;

    if (!requests || requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox display-3"></i>
                    <div class="mt-3">No requests submitted yet.</div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.assetName}</td>
            <td>${request.quantity}</td>
            <td>${request.purpose}</td>
            <td>
                <span class="badge rounded-pill ${request.status === "Approved" ? "text-bg-success" : request.status === "Declined" ? "text-bg-danger" : "text-bg-warning"}">
                    ${request.status}
                </span>
            </td>
        </tr>
    `).join("");
}

function renderStaffStats() {
    const assets = getAssets();
    const requests = getRequests();
    const availableCount = assets.length;
    const totalQuantity = assets.reduce((acc, asset) => acc + Number(asset.quantity || 0), 0);
    const requestCount = requests.length;

    const availableElm = document.getElementById("availableAssetsCount");
    if (availableElm) availableElm.innerText = availableCount;
    const inStockElm = document.getElementById("inStockCount");
    if (inStockElm) inStockElm.innerText = totalQuantity;
    const requestsElm = document.getElementById("myRequestsCount");
    if (requestsElm) requestsElm.innerText = requestCount;
}

function populateCategoryFilter() {
    const filter = document.getElementById("categoryFilter");
    if (!filter) return;

    const categories = [...new Set(getAssets().map(asset => asset.category || "Other"))].sort();
    filter.innerHTML = `
        <option value="all">All Categories</option>
        ${categories.map(category => `<option value="${category}">${category}</option>`).join("")}
    `;
}

function loadManagerPage() {
    currentAssetList = getAssets();
    renderAssetTable(currentAssetList);
    setInventoryView("assets");
}

function loadBuckets() {
    const assets = getAssets();
    const buckets = computeBuckets(assets, 11);
    renderBuckets(buckets);
}

function renderBuckets(data) {
    let html = "";
    currentAssetList = [];

    data.forEach((bucket, index) => {
        const hasCollision = bucket.length > 1;
        bucket.forEach(item => currentAssetList.push({...item, bucket: index}));

        html += `
            <div class="col-md-6">
                <div class="bucket-card ${hasCollision ? "bucket-collision" : ""}">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-dark">Index ${index}</span>
                        ${hasCollision ? '<span class="badge bg-danger">Collision</span>' : ""}
                    </div>
        `;

        if (bucket.length === 0) {
            html += `
                <div class="text-center py-4 text-muted small">
                    Empty Slot
                </div>
            `;
        } else {
            html += `
                <div class="table-responsive mt-3">
                    <table class="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            bucket.forEach(item => {
                html += `
                    <tr>
                        <td>${item.assetId}</td>
                        <td>${item.name}</td>
                        <td>${item.category}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    });

    const buckets = document.getElementById("buckets");
    if (buckets) {
        buckets.innerHTML = html;
    }

    renderAssetTable(currentAssetList);
    updateStats(data);
}

function updateStats(data) {
    let totalItems = 0;
    let totalQuantity = 0;
    let activeBuckets = 0;

    data.forEach(bucket => {
        if (bucket.length > 0) activeBuckets++;
        totalItems += bucket.length;
        bucket.forEach(item => totalQuantity += Number(item.quantity || 0));
    });

    const totalItemsElm = document.getElementById("totalItems");
    if (totalItemsElm) totalItemsElm.innerText = totalItems;
    const totalQuantityElm = document.getElementById("totalQuantity");
    if (totalQuantityElm) totalQuantityElm.innerText = totalQuantity;
    const activeBucketsElm = document.getElementById("activeBuckets");
    if (activeBucketsElm) activeBucketsElm.innerText = `${activeBuckets} / ${data.length}`;
}

function setInventoryView(view) {
    const assetSection = document.getElementById("assetTableSection");
    const topologySection = document.getElementById("hashTopologySection");
    const requestSection = document.getElementById("requestSection");
    const assetsBtn = document.getElementById("viewAssetsBtn");
    const topologyBtn = document.getElementById("viewTopologyBtn");

    if (!assetSection || !topologySection) return;

    const isTopology = view === "topology";
    const isRequests = view === "requests";

    assetSection.classList.toggle("d-none", isTopology || isRequests);
    topologySection.classList.toggle("d-none", !isTopology);
    requestSection?.classList.toggle("d-none", !isRequests);

    assetsBtn?.classList.toggle("btn-primary", !isTopology && !isRequests);
    assetsBtn?.classList.toggle("btn-outline-secondary", isTopology || isRequests);
    topologyBtn?.classList.toggle("btn-primary", isTopology);
    topologyBtn?.classList.toggle("btn-outline-secondary", !isTopology);

    if (isTopology) {
        loadBuckets();
    } else if (isRequests) {
        loadRequestReview();
    } else {
        renderAssetTable(currentAssetList);
    }
}

function loadRequestReview() {
    const requests = getRequests();
    renderRequestReview(requests);
}

function renderRequestReview(requests) {
    const tableBody = document.getElementById("requestTableBody");
    if (!tableBody) return;

    if (!requests || requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-muted text-center py-4">No requests submitted yet.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.assetName} (${request.assetId})</td>
            <td>${request.quantity}</td>
            <td>${request.purpose}</td>
            <td>
                <span class="badge rounded-pill ${request.status === "Approved" ? "text-bg-success" : request.status === "Declined" ? "text-bg-danger" : "text-bg-warning"}">
                    ${request.status}
                </span>
            </td>
            <td>${request.submittedAt || "-"}</td>
            <td class="text-end">
                ${request.status === "Pending" ? `<button class="btn btn-sm btn-outline-primary rounded-pill" onclick="openRequestApprovalModal('${request.requestId}')">Review</button>` : `<span class="text-muted small">No action</span>`}
            </td>
        </tr>
    `).join("");
}

function openRequestApprovalModal(requestId) {
    const requests = getRequests();
    const request = requests.find(item => item.requestId === requestId);
    if (!request) {
        showAlert("Request not found.", "danger");
        return;
    }

    document.getElementById("approvalRequestId").value = request.requestId;
    document.getElementById("approvalAssetName").value = `${request.assetName} (${request.assetId})`;
    document.getElementById("approvalQuantity").value = request.quantity;
    document.getElementById("approvalPurpose").value = request.purpose;
    document.getElementById("approvalSubmittedAt").value = request.submittedAt || "-";

    const modal = new bootstrap.Modal(document.getElementById("requestApprovalModal"));
    modal.show();
}

function processRequestDecision(decision) {
    const requestId = document.getElementById("approvalRequestId")?.value;
    if (!requestId) return;

    const requests = getRequests();
    const updatedRequests = requests.map(item => {
        if (item.requestId !== requestId) return item;
        if (item.status !== "Pending") return item;
        return {...item, status: decision};
    });

    saveRequests(updatedRequests);

    if (decision === "Declined") {
        const request = requests.find(item => item.requestId === requestId);
        if (request) {
            const assets = getAssets();
            const updatedAssets = assets.map(asset => asset.assetId === request.assetId ? {...asset, quantity: Number(asset.quantity || 0) + Number(request.quantity || 0)} : asset);
            saveAssets(updatedAssets);
            loadBuckets();
        }
    }

    renderRequestReview(getRequests());
    showAlert(`Request ${decision.toLowerCase()} successfully.`);
    bootstrap.Modal.getInstance(document.getElementById("requestApprovalModal"))?.hide();
}

function addHardware() {
    const assetId = document.getElementById("assetId")?.value.trim();
    const name = document.getElementById("name")?.value.trim();
    const category = document.getElementById("category")?.value.trim();
    const quantity = Number(document.getElementById("quantity")?.value);

    if (!assetId || !name || !category || quantity <= 0) {
        showAlert("Please complete all fields correctly.", "warning");
        return;
    }

    const assets = getAssets();
    if (assets.some(item => item.assetId.toLowerCase() === assetId.toLowerCase())) {
        showAlert("Asset already exists.", "warning");
        return;
    }

    assets.unshift({assetId, name, category, quantity});
    saveAssets(assets);
    showAlert("Hardware added successfully.");
    document.getElementById("registerAssetForm")?.reset();
    bootstrap.Modal.getInstance(document.getElementById("registerAssetModal"))?.hide();
    loadBuckets();
    if (document.getElementById("requestAssetSelect")) {
        populateRequestAssetSelect();
    }
}

function deleteHardware(assetId) {
    if (!confirm("Delete asset " + assetId + "?")) return;

    let assets = getAssets();
    assets = assets.filter(asset => asset.assetId !== assetId);
    saveAssets(assets);
    showAlert("Asset deleted successfully.");
    loadBuckets();
}

function searchHardwareModal() {
    const input = document.getElementById("navSearchId");
    const modalBody = document.getElementById("modalSearchResult");
    if (!input || !modalBody) return;

    const id = input.value.trim();
    if (!id) {
        showAlert("Please enter an Asset ID.", "warning");
        return;
    }

    modalBody.innerHTML = "Searching...";
    const modal = new bootstrap.Modal(document.getElementById("searchModal"));
    modal.show();

    const asset = getAssets().find(item => item.assetId.toLowerCase() === id.toLowerCase());
    if (!asset) {
        modalBody.innerHTML = `<div class="alert alert-warning mb-0">Hardware not found.</div>`;
        return;
    }

    modalBody.innerHTML = `
        <div class="text-start">
            <h5 class="fw-bold mb-3">${asset.assetId}</h5>
            <p class="mb-1"><strong>Name:</strong> ${asset.name}</p>
            <p class="mb-1"><strong>Category:</strong> ${asset.category}</p>
            <p class="mb-0"><strong>Quantity:</strong> ${asset.quantity}</p>
        </div>
    `;
}

function filterAssetTable() {
    const input = document.getElementById("assetFilterInput");
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    const filtered = getAssets().filter(asset =>
        asset.assetId.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query)
    );
    renderAssetTable(query ? filtered : getAssets());
}

function filterCategory() {
    const selected = document.getElementById("categoryFilter")?.value.toLowerCase();
    if (!selected) return;

    const rows = document.querySelectorAll("#staffAssetTableBody tr[data-category]");
    rows.forEach(row => {
        const category = row.getAttribute("data-category")?.toLowerCase();
        row.style.display = selected === "all" || category === selected ? "" : "none";
    });
}

function setRequestAssetSelection(assetId, assetName) {
    const select = document.getElementById("requestAssetSelect");
    const display = document.getElementById("requestAssetDisplay");
    const idInput = document.getElementById("requestAssetId");
    const nameInput = document.getElementById("requestAssetName");

    if (select && assetId) {
        select.value = assetId;
    }
    if (idInput) {
        idInput.value = assetId || "";
    }
    if (nameInput) {
        nameInput.value = assetName || "";
    }
    if (display) {
        display.value = assetName || "";
    }
}

function populateRequestAssetSelect() {
    const select = document.getElementById("requestAssetSelect");
    if (!select) return;

    const assets = getAssets();
    select.innerHTML = `
        <option value="" selected disabled>Select asset...</option>
        ${assets.map(asset => `<option value="${asset.assetId}" data-name="${asset.name}">${asset.assetId} — ${asset.name}</option>`).join("")}
    `;

    select.addEventListener("change", event => {
        const option = event.target.selectedOptions[0];
        const assetId = event.target.value;
        const assetName = option?.dataset.name || "";
        setRequestAssetSelection(assetId, assetName);
    });
}

function fillRequestModal(button) {
    const assetId = button.getAttribute("data-id");
    const assetName = button.getAttribute("data-name");
    setRequestAssetSelection(assetId, assetName);
}

function submitRequest(event) {
    event.preventDefault();
    const assetId = document.getElementById("requestAssetId")?.value;
    const assetName = document.getElementById("requestAssetName")?.value;
    const quantity = Number(document.querySelector("#requestAssetForm input[name=quantity]")?.value);
    const purpose = document.querySelector("#requestAssetForm textarea[name=purpose]")?.value.trim();

    if (!assetId || !assetName || !purpose || quantity <= 0) {
        showAlert("Please complete the request form.", "warning");
        return;
    }

    const assets = getAssets();
    const asset = assets.find(item => item.assetId === assetId);
    if (!asset) {
        showAlert("Selected asset was not found.", "danger");
        return;
    }

    if (quantity > asset.quantity) {
        showAlert("Requested quantity exceeds available stock.", "warning");
        return;
    }

    const updatedAssets = assets.map(item =>
        item.assetId === assetId ? {...item, quantity: item.quantity - quantity} : item
    );

    saveAssets(updatedAssets);

    const requests = getRequests();
    requests.unshift({
        requestId: `REQ-${Date.now()}`,
        assetId,
        assetName,
        quantity,
        purpose,
        status: "Pending",
        submittedAt: new Date().toLocaleString()
    });

    saveRequests(requests);
    renderStaffAssetTable(updatedAssets);
    renderRequestHistory(requests);
    renderStaffStats();
    populateCategoryFilter();
    document.getElementById("requestAssetForm")?.reset();
    bootstrap.Modal.getInstance(document.getElementById("requestModal"))?.hide();
    showAlert("Request submitted successfully.");
}

function loadNavbarProfile() {
    const user = getSession();
    const name = user?.name || "Guest User";
    const role = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : "Guest";
    const navbarUserName = document.getElementById("navbarUserName");
    if (navbarUserName) navbarUserName.innerText = name;
    const navbarUserRole = document.getElementById("navbarUserRole");
    if (navbarUserRole) navbarUserRole.innerText = role;
    const navbarUserNameDetail = document.getElementById("navbarUserNameDetail");
    if (navbarUserNameDetail) navbarUserNameDetail.innerText = name;
    const navbarUserRoleDetail = document.getElementById("navbarUserRoleDetail");
    if (navbarUserRoleDetail) navbarUserRoleDetail.innerText = role;
    const accessRoleLabel = document.getElementById("accessRoleLabel");
    if (accessRoleLabel) accessRoleLabel.innerText = role;
}

function populateProfileForm() {
    const user = getSession();
    if (!user) return;
    const profileName = document.getElementById("profileName");
    if (profileName) profileName.value = user.name || "";
    const profileEmail = document.getElementById("profileEmail");
    if (profileEmail) profileEmail.value = user.email || "";
    const profileRole = document.getElementById("profileRole");
    if (profileRole) profileRole.value = user.role || "staff";
}

function submitProfileForm(event) {
    event.preventDefault();
    const user = getSession();
    if (!user) return;

    const name = document.getElementById("profileName")?.value.trim();
    const role = document.getElementById("profileRole")?.value;

    if (!name || !role) {
        showAlert("Please enter a valid name and role.", "warning");
        return;
    }

    const users = getUsers();
    const updatedUsers = users.map(item => item.email === user.email ? {...item, name, role} : item);
    saveUsers(updatedUsers);

    const updatedSession = {...user, name, role};
    saveSession(updatedSession);
    loadNavbarProfile();

    bootstrap.Modal.getInstance(document.getElementById("profileModal"))?.hide();
    showAlert("Profile updated successfully.");
}

function setActivePage() {
    const path = window.location.pathname.split("/").pop();
    const activeDashboard = document.querySelector(".dropdown-item.active");
    if (["index.html", "", "staff-dashboard.html", "index", "dashboard", "staff-dashboard"].includes(path)) {
        return;
    }
    activeDashboard?.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    initDemoData();
    loadNavbarProfile();
    populateProfileForm();
    setActivePage();

    if (document.getElementById("assetTableBody")) {
        loadManagerPage();
    }

    if (document.getElementById("staffAssetTableBody")) {
        renderStaffAssetTable(getAssets());
        renderRequestHistory(getRequests());
        renderStaffStats();
        populateCategoryFilter();
    }

    if (document.getElementById("requestAssetSelect")) {
        populateRequestAssetSelect();
    }

    document.getElementById("requestAssetForm")?.addEventListener("submit", submitRequest);
    document.getElementById("navSearchId")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchHardwareModal();
        }
    });

    document.getElementById("assetFilterInput")?.addEventListener("input", filterAssetTable);
    document.getElementById("categoryFilter")?.addEventListener("change", filterCategory);
    document.getElementById("profileForm")?.addEventListener("submit", submitProfileForm);
});

