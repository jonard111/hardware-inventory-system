/* =============================================
   HardwareNexus — app.js
============================================= */

let currentAssetList = [];

/* ─── UTILITIES ──────────────────────────── */

function getCategoryName(category) {
    return category?.name ?? category ?? "N/A";
}

function showAlert(message, type = "success") {
    const box = document.getElementById("alertBox");
    if (!box) return;
    box.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        const el = box.querySelector(".alert");
        if (el) bootstrap.Alert.getOrCreateInstance(el).close();
    }, 4000);
}

/* ─── INVENTORY VIEW SWITCHER (Manager) ─── */

function setInventoryView(view) {
    const assetSection    = document.getElementById("assetTableSection");
    const topologySection = document.getElementById("hashTopologySection");
    const requestSection  = document.getElementById("requestSection");
    const viewAssetsBtn   = document.getElementById("viewAssetsBtn");
    const viewTopologyBtn = document.getElementById("viewTopologyBtn");

    if (assetSection)    assetSection.classList.add("d-none");
    if (topologySection) topologySection.classList.add("d-none");
    if (requestSection)  requestSection.classList.add("d-none");

    if (viewAssetsBtn) {
        viewAssetsBtn.classList.remove("btn-primary");
        viewAssetsBtn.classList.add("btn-outline-secondary");
    }
    if (viewTopologyBtn) {
        viewTopologyBtn.classList.remove("btn-primary");
        viewTopologyBtn.classList.add("btn-outline-secondary");
    }

    if (view === "assets") {
        if (assetSection) assetSection.classList.remove("d-none");
        if (viewAssetsBtn) {
            viewAssetsBtn.classList.add("btn-primary");
            viewAssetsBtn.classList.remove("btn-outline-secondary");
        }
    } else if (view === "topology") {
        if (topologySection) topologySection.classList.remove("d-none");
        if (viewTopologyBtn) {
            viewTopologyBtn.classList.add("btn-primary");
            viewTopologyBtn.classList.remove("btn-outline-secondary");
        }
        loadBuckets();
    } else if (view === "requests") {
        if (requestSection) requestSection.classList.remove("d-none");
        loadRequestReview();
    }
}

/* ─── ADD HARDWARE ──────────────────────── */

function addHardware() {
    const hardware = {
        name:     document.getElementById("name")?.value.trim(),
        category: document.getElementById("category")?.value,
        quantity: Number(document.getElementById("quantity")?.value)
    };

    if (!hardware.name || !hardware.category || hardware.quantity <= 0) {
        showAlert("Please complete all required fields correctly.", "warning");
        return;
    }

    fetch("/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hardware)
    })
    .then(res => res.text())
    .then(msg => {
        if (msg.includes("already exists")) {
            showAlert(msg, "warning");
            return;
        }
        showAlert("Hardware added successfully.");
        document.getElementById("registerAssetForm")?.reset();
        bootstrap.Modal.getInstance(document.getElementById("registerAssetModal"))?.hide();
        loadBuckets();
    })
    .catch(() => showAlert("Failed to add hardware.", "danger"));
}

/* ─── DELETE HARDWARE ───────────────────── */

function deleteHardware(assetId) {
    if (!confirm(`Delete asset ${assetId}?`)) return;

    fetch(`/api/inventory/delete/${encodeURIComponent(assetId)}`, { method: "DELETE" })
        .then(res => res.text())
        .then(msg => {
            showAlert(msg, "success");
            loadBuckets();
        })
        .catch(() => showAlert("Failed to delete asset.", "danger"));
}

/* ─── EDIT / UPDATE HARDWARE ────────────── */

function openEditModal(assetId, name, category, quantity) {
    document.getElementById("updateAssetId").value  = assetId;
    document.getElementById("updateName").value     = name;
    document.getElementById("updateQuantity").value = quantity;

    // Handles value assignment seamlessly matching structural setup options
    const categoryDropdown = document.getElementById("updateCategory");
    if (categoryDropdown) {
        categoryDropdown.value = category;
    }

    new bootstrap.Modal(document.getElementById("updateAssetModal")).show();
}

function updateHardware() {
    const assetId  = document.getElementById("updateAssetId").value.trim();
    const name     = document.getElementById("updateName").value.trim();
    const category = document.getElementById("updateCategory").value;
    const quantity = Number(document.getElementById("updateQuantity").value);

    if (!name || !category || quantity < 0) {
        showAlert("Please complete all fields correctly.", "warning");
        return;
    }

    fetch(`/api/inventory/update/${encodeURIComponent(assetId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, name, category, quantity })
    })
    .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.text();
    })
    .then(msg => {
        showAlert(msg || "Asset updated successfully.", "success");
        bootstrap.Modal.getInstance(document.getElementById("updateAssetModal"))?.hide();
        document.getElementById("updateAssetForm").reset();
        loadBuckets();
    })
    .catch(err => {
        console.error("Update failed:", err);
        showAlert("Failed to update asset.", "danger");
    });
}

/* ─── ASSET TABLE RENDERING ─────────────── */

function renderAssetTable(assets) {
    const tableBody = document.getElementById("assetTableBody");
    if (!tableBody) return;

    if (!assets?.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No assets found.</td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = assets.map(asset => `
        <tr>
            <td>${asset.assetId}</td>
            <td>${asset.name}</td>
            <td>${getCategoryName(asset.category)}</td>
            <td>${asset.quantity}</td>
            <td class="text-end d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-primary rounded-pill px-3"
                    onclick="openEditModal(
                        '${asset.assetId}',
                        '${asset.name.replace(/'/g, "\\'")}',
                        '${getCategoryName(asset.category).replace(/'/g, "\\'")}',
                        ${asset.quantity}
                    )">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger rounded-pill px-3"
                    onclick="deleteHardware('${asset.assetId}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

/* ─── ASSET TABLE FILTER ────────────────── */

function filterAssetTable() {
    const input = document.getElementById("assetFilterInput");
    if (!input) return;

    const query = input.value.toLowerCase();

    const filtered = currentAssetList.filter(a => {
        const category = getCategoryName(a.category).toLowerCase();
        return (
            a.assetId.toLowerCase().includes(query) ||
            a.name.toLowerCase().includes(query) ||
            category.includes(query)
        );
    });

    renderAssetTable(query ? filtered : currentAssetList);
}

/* ─── HASH BUCKET RENDERING (Chaining Structure) ─── */

function renderBuckets(data) {
    let html = "";
    currentAssetList = [];

    const topologySearchInput = document.getElementById("topologySearchInput");
    if (topologySearchInput) {
        topologySearchInput.value = "";
    }
    const topologySearchFeedback = document.getElementById("topologySearchFeedback");
    if (topologySearchFeedback) {
        topologySearchFeedback.classList.add("d-none");
        topologySearchFeedback.innerHTML = "";
    }

    data.forEach((bucket, index) => {
        bucket.forEach(item => currentAssetList.push({ ...item, bucket: index }));

        html += `
        <div class="hash-bucket-row mb-3">
            <div class="bucket-index-box">
                <span class="index-label">Index ${index}</span>
            </div>
            
            <div class="chain-pointer-arrow">
                <i class="bi bi-arrow-right"></i>
            </div>
            
            <div class="horizontal-chain">`;

        if (!bucket || bucket.length === 0) {
            html += `
                <div class="node-null">NULL</div>`;
        } else {
            bucket.forEach(item => {
                html += `
                <div class="chain-node-item">
                    <div class="node-content-block">
                        <div class="node-header">ID: ${item.assetId || item.id}</div>
                        <div class="node-body">
                            <strong>${item.name}</strong><br>
                            <small class="text-muted">${getCategoryName(item.category)} (Qty: ${item.quantity})</small>
                        </div>
                    </div>
                    <div class="node-connector">
                        <i class="bi bi-arrow-right"></i>
                    </div>
                </div>`;
            });

            html += `<div class="node-null">NULL</div>`;
        }

        html += `
            </div>
        </div>`;
    });

    const bucketsEl = document.getElementById("buckets");
    if (bucketsEl) {
        bucketsEl.className = "hash-visual-container";
        bucketsEl.innerHTML = html;
    }

    if (typeof renderAssetTable === "function") renderAssetTable(currentAssetList);
    if (typeof updateStats === "function") updateStats(data);
}

/* ─── LOAD BUCKETS ──────────────────────── */

function loadBuckets() {
    fetch("/api/inventory/buckets")
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        })
        .then(data => renderBuckets(data))
        .catch(err => {
            console.error("Bucket load failed:", err);
            showAlert("Failed to load inventory data.", "danger");
        });
}

/* ─── STATS UPDATE ──────────────────────── */

function updateStats(data) {
    let totalItems = 0, totalQuantity = 0, activeBuckets = 0;

    data.forEach(bucket => {
        if (bucket.length > 0) activeBuckets++;
        totalItems += bucket.length;
        bucket.forEach(item => { totalQuantity += item.quantity; });
    });

    const el = id => document.getElementById(id);
    if (el("totalItems"))    el("totalItems").innerText    = totalItems;
    if (el("totalQuantity")) el("totalQuantity").innerText = totalQuantity;
    if (el("activeBuckets")) el("activeBuckets").innerText = `${activeBuckets} / ${data.length}`;
}

/* ─── REQUEST REVIEW (Manager) ─────────── */

function loadRequestReview() {
    fetch("/api/requests/all")
        .then(async res => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        })
        .then(requests => renderRequestTable(requests))
        .catch(err => {
            console.error("Request load failed:", err);
            showAlert("Failed to load asset requests.", "danger");
        });
}

function renderRequestTable(requests) {
    const tbody = document.getElementById("requestTableBody");
    if (!tbody) return;

    if (!requests?.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No requests submitted yet.</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = requests.map(r => {
        const statusClass =
            r.status === "Pending"  ? "bg-warning text-dark" :
            r.status === "Approved" ? "bg-success" : "bg-danger";

        const actionBtn = r.status === "Pending"
            ? `<button class="btn btn-sm btn-primary rounded-pill"
                   onclick="openApprovalModal(${JSON.stringify(r).replace(/"/g, '&quot;')})">
                   Review
               </button>`
            : `<span class="badge ${statusClass} rounded-pill px-3 py-2">${r.status}</span>`;

        return `
        <tr>
            <td class="fw-semibold">${r.assetName ?? r.assetId}</td>
            <td>${r.quantity}</td>
            <td>${r.purpose ?? "—"}</td>
            <td><span class="badge ${statusClass} rounded-pill">${r.status}</span></td>
            <td>${r.dateCreated ?? r.submittedAt ?? "—"}</td>
            <td class="text-end">${actionBtn}</td>
        </tr>`;
    }).join("");
}

function openApprovalModal(request) {
    document.getElementById("approvalRequestId").value   = request.id ?? request.requestId ?? "";
    document.getElementById("approvalAssetName").value   = request.assetName ?? request.assetId ?? "";
    document.getElementById("approvalQuantity").value    = request.quantity ?? "";
    document.getElementById("approvalPurpose").value     = request.purpose ?? "";
    document.getElementById("approvalSubmittedAt").value = request.dateCreated ?? request.submittedAt ?? "";

    new bootstrap.Modal(document.getElementById("requestApprovalModal")).show();
}

function processRequestDecision(decision) {
    const requestId = document.getElementById("approvalRequestId")?.value;
    if (!requestId) {
        showAlert("No request selected.", "warning");
        return;
    }

    fetch(`/api/requests/${encodeURIComponent(requestId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
    })
    .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.text();
    })
    .then(() => {
        bootstrap.Modal.getInstance(document.getElementById("requestApprovalModal"))?.hide();
        showAlert(`Request ${decision.toLowerCase()} successfully.`,
                  decision === "Approved" ? "success" : "warning");
        loadRequestReview();
        loadBuckets();
    })
    .catch(err => {
        console.error("Decision failed:", err);
        showAlert(`Failed to ${decision.toLowerCase()} request.`, "danger");
    });
}

/* ─── SEARCH MODAL ──────────────────────── */

function searchHardwareModal() {
    const input = document.getElementById("navSearchId")?.value.toLowerCase() ?? "";
    const container = document.getElementById("modalSearchResult");
    if (!container) return;
    container.innerHTML = "";

    if (currentAssetList.length) {
        const results = currentAssetList.filter(a =>
            a.assetId.toLowerCase().includes(input) ||
            a.name.toLowerCase().includes(input)
        );

        if (!results.length) {
            container.innerHTML = `<div class="text-center text-muted py-4">No matching assets found.</div>`;
        } else {
            results.forEach(asset => {
                const card = document.createElement("div");
                card.className = "border rounded-4 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2";
                card.innerHTML = `
                    <div>
                        <div class="fw-bold">${asset.name}</div>
                        <small class="text-muted">
                            ID: ${asset.assetId} &bull; Category: ${getCategoryName(asset.category)} &bull; Qty: ${asset.quantity}
                        </small>
                    </div>
                    <span class="badge ${asset.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                        ${asset.quantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>`;
                container.appendChild(card);
            });
        }
    } else {
        const rows = document.querySelectorAll("#staffAssetTableBody tr[data-category]");
        let found = 0;

        rows.forEach(row => {
            const id       = row.children[0]?.innerText.toLowerCase() ?? "";
            const name     = row.children[1]?.innerText ?? "";
            const category = row.children[2]?.innerText ?? "";
            const quantity = row.children[3]?.innerText ?? "0";

            if (id.includes(input) || name.toLowerCase().includes(input)) {
                found++;
                const card = document.createElement("div");
                card.className = "border rounded-4 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2";
                card.innerHTML = `
                    <div>
                        <div class="fw-bold">${name}</div>
                        <small class="text-muted">
                            ID: ${row.children[0].innerText} &bull; Category: ${category} &bull; Qty: ${quantity}
                        </small>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="badge ${parseInt(quantity) > 0 ? 'bg-success' : 'bg-danger'}">
                            ${parseInt(quantity) > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                        <button class="btn btn-primary btn-sm rounded-pill"
                            data-id="${row.children[0].innerText}"
                            data-name="${name}"
                            onclick="openRequestFromSearch(this)">
                            Request
                        </button>
                    </div>`;
                container.appendChild(card);
            }
        });

        if (!found) {
            container.innerHTML = `<div class="text-center text-muted py-4">No matching assets found.</div>`;
        }
    }

    new bootstrap.Modal(document.getElementById("searchModal")).show();
}

/* ─── STAFF: REQUEST FROM SEARCH ────────── */

function openRequestFromSearch(btn) {
    document.getElementById("requestAssetId").value      = btn.dataset.id;
    document.getElementById("requestAssetName").value    = btn.dataset.name;
    document.getElementById("requestAssetDisplay").value = btn.dataset.name;

    bootstrap.Modal.getInstance(document.getElementById("searchModal"))?.hide();
    new bootstrap.Modal(document.getElementById("requestModal")).show();
}

/* ─── STAFF: FILL REQUEST MODAL ─────────── */

function fillRequestModal(btn) {
    const assetId   = btn.getAttribute("data-id")   ?? "";
    const assetName = btn.getAttribute("data-name") ?? "";

    const idField      = document.getElementById("requestAssetId");
    const nameField    = document.getElementById("requestAssetName");
    const displayField = document.getElementById("requestAssetDisplay");

    if (idField)      idField.value      = assetId;
    if (nameField)    nameField.value    = assetName;
    if (displayField) displayField.value = assetName;
}

/* ─── STAFF: CATEGORY FILTER ────────────── */

function filterCategory() {
    const select = document.getElementById("categoryFilter");
    if (!select) return;

    const selected = select.value.toLowerCase();
    const rows = document.querySelectorAll("#staffAssetTableBody tr[data-category]");

    rows.forEach(row => {
        const rowCategory = (row.getAttribute("data-category") ?? "").toLowerCase();
        row.style.display = (selected === "all" || rowCategory === selected) ? "" : "none";
    });
}

/* ─── HASH TOPOLOGY SEARCH ──────────────── */

function searchTopology() {
    const input = document.getElementById("topologySearchInput");
    const feedback = document.getElementById("topologySearchFeedback");
    if (!input || !feedback) return;

    const query = input.value.trim().toLowerCase();

    // Clear previous highlights
    document.querySelectorAll(".chain-node-item").forEach(node => {
        node.classList.remove("highlighted-node");
    });

    if (!query) {
        feedback.classList.add("d-none");
        feedback.innerHTML = "";
        return;
    }

    // Search in currentAssetList.
    // Note: currentAssetList has items with property 'name' and 'bucket' (which is the bucket index)
    const foundItems = currentAssetList.filter(item => item.name && item.name.toLowerCase().includes(query));

    if (foundItems.length === 0) {
        feedback.classList.remove("d-none");
        feedback.className = "mt-2 text-danger fw-semibold small animate-fade-in";
        feedback.innerText = `No assets match name "${input.value}"`;
        return;
    }

    // If we have matches, let's highlight them in the DOM and display the index
    feedback.classList.remove("d-none");
    feedback.className = "mt-2 text-success fw-semibold small animate-fade-in";

    const indexMessages = foundItems.map(item => {
        // Find matching nodes in the DOM and highlight them
        const nodes = document.querySelectorAll(".chain-node-item");
        nodes.forEach(node => {
            const header = node.querySelector(".node-header");
            const nameEl = node.querySelector(".node-body strong");
            if (header && nameEl) {
                const idText = header.innerText.replace("ID: ", "").trim();
                const nameText = nameEl.innerText.trim();
                
                if (idText === item.assetId && nameText === item.name) {
                    node.classList.add("highlighted-node");
                }
            }
        });

        return `"${item.name}" (ID: ${item.assetId}) is inserted in Slot Index ${item.bucket}`;
    });

    feedback.innerHTML = indexMessages.join("<br>");
}

/* ─── DOM READY ─────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("assetTableBody")) {
        loadBuckets();
        setInventoryView("assets");
    }

    const filterInput = document.getElementById("assetFilterInput");
    if (filterInput) {
        filterInput.addEventListener("input", filterAssetTable);
    }
});

/* ─── USER INFO ─────────────────────────── */

function setUserInfo(name, role) {
    document.querySelectorAll(".js-user-name").forEach(el => el.textContent = name);
    document.querySelectorAll(".js-user-role").forEach(el => el.textContent = role);
}