# Demo Script for **Hardware Inventory System** Presentation

---
## 1. Prerequisites (Setup)
- **Java 17+** installed and `java` on PATH.
- **Maven 3.9+** installed (`mvn` command).
- **MySQL** (or MariaDB) server running locally.
  - Create a database: `CREATE DATABASE hardware_inventory;`
  - Update `src/main/resources/application‑properties` with your DB credentials:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/hardware_inventory
    spring.datasource.username=your_user
    spring.datasource.password=your_password
    ```
- Optional: **Git** if you plan to clone the repo.

---
## 2. Build & Run the Application
```bash
# Clone (if needed)
git clone https://github.com/jonard111/hardware-inventory-system.git
cd hardware-inventory-system

# Build the jar (skip tests for speed during demo)
./mvnw clean package -DskipTests

# Run the Spring Boot app
java -jar target/*.jar
```
> **Tip**: Use `./mvnw spring-boot:run` for a hot‑reloading dev experience.

The console should display:
```
Started HardwareInventorySystemApplication in X.XX seconds (JVM running for X.XX)
Tomcat started on port(s): 8080 (http) with context path ''
```
Open your browser and navigate to `http://localhost:8080`.

---
## 3. Presentation Flow (Step‑by‑Step)
### 3.1 Landing Page & Login
1. The landing page welcomes the user with a **glass‑card** hero section (premium UI).
2. Click **Login** (top‑right). Use the pre‑seeded admin credentials (e.g., `admin / admin123`).
3. Observe the smooth **modal fade‑in** and validation feedback.

### 3.2 Asset Management Dashboard
1. After login you land on the **Dashboard** showing three cards:
   - **Live View** – visual hash topology.
   - **Inventory List** – table of assets.
   - **Add New Asset** – quick entry form.
2. Click **Add New Asset** → fill fields (Name, Type, Serial, Owner) → **Save**.
3. A toast notification appears (`Asset added successfully!`) with a subtle slide‑up animation.
4. The newly added asset instantly appears in the **Inventory List** (server‑side pagination).

### 3.3 Hash Topology – Visualisation
1. In the **Live View** card, notice the **Separate Chaining Distribution Map** rendered via an HTML canvas powered by `app.js`.
2. Each bucket is a vertical column; assets appear as coloured circles.
3. The UI uses **dark‑mode gradients**, micro‑animations on hover, and a **glass‑morphism** card background.

### 3.4 Search Asset in Topology (New Feature)
1. Locate the **search bar** on the right side of the topology header (thanks to the recent layout tweak).
2. Type the exact asset **name** you just created.
3. As you type, the script `searchTopology()`:
   - Filters the canvas nodes.
   - Highlights the matching asset with a `highlighted-node` pulsating ring.
   - Shows a feedback message underneath: `Asset "<name>" found in bucket index X`.
4. Demonstrate the **responsive behaviour** by resizing the browser – the search bar stays right‑aligned.

### 3.5 Error Handling & Validation Demo
1. Try adding an asset with a duplicate serial number.
2. The form surface displays a **red alert** (Bootstrap `alert-danger`) with the server‑side validation message.
3. Attempt a search for a non‑existent asset; the feedback text shows `No matching asset found` in muted gray.

---
## 4. Closing the Demo
- Click **Logout** (top‑right) – returns to the landing page with a smooth slide transition.
- Mention the underlying tech stack:
  - **Spring Boot** (MVC, Thymeleaf, JPA)
  - **Bootstrap 5** + custom CSS for premium UI (glass‑card, gradients)
  - **JavaScript** visualisation using Canvas API.
- Highlight the **extensible architecture** – new data structures can be visualised by adding a new component.

---
## 5. Optional – Run a Quick Smoke Test (one‑liner)
```bash
curl -X POST http://localhost:8080/api/assets -H "Content-Type: application/json" -d '{"name":"Demo‑Server","type":"Server","serial":"DS12345","owner":"Demo"}'
```
Check the JSON response and then refresh the Dashboard to see the entry.

---
## 6. Presentation Tips
- Keep the browser window **maximised** to showcase the full‑width gradient background.
- Use a **laser pointer** (or screen annotation tool) to highlight the search bar movement after the layout change.
- Play the brief **toast animation** a couple of times – it reinforces the premium feel.
- If time permits, switch to **dark mode** (toggle at the top‑right) to demonstrate the responsive design.

---
*Prepared by Antigravity – your premium AI coding assistant.*
