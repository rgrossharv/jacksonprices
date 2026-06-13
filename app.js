(function () {
  const data = window.priceWatchData;
  const groceryItems = data.items.filter((item) => item.category !== "Fuel");
  const fuelItems = data.items.filter((item) => item.category === "Fuel");
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const dateFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  const tableHead = document.querySelector("#table-head");
  const tableBody = document.querySelector("#price-table");
  const categoryFilter = document.querySelector("#category-filter");

  function formatPrice(value) {
    return Number.isFinite(value) ? money.format(value) : "N/A";
  }

  function lowStoreIds(item) {
    const values = Object.entries(item.prices).filter(([, value]) => Number.isFinite(value));
    if (!values.length) return [];
    const lowest = Math.min(...values.map(([, value]) => value));
    return values.filter(([, value]) => value === lowest).map(([store]) => store);
  }

  function lowFuelStationIds(item) {
    const values = Object.entries(item.prices).filter(([, value]) => Number.isFinite(value));
    if (!values.length) return [];
    const lowest = Math.min(...values.map(([, value]) => value));
    return values.filter(([, value]) => value === lowest).map(([station]) => station);
  }

  function renderMetadata() {
    const updated = new Date(`${data.lastUpdated}T12:00:00`);
    const next = new Date(`${data.nextUpdate}T12:00:00`);
    document.title = `${data.townName} Prices`;
    document.querySelector(".brand span").textContent = `${data.townName} Prices`;
    document.querySelector("#last-updated").textContent = `Updated ${dateFormat.format(updated)}`;
    document.querySelector("#price-count").textContent = `${data.items.length} tracked prices`;
    document.querySelector("#store-count").textContent = `${data.stores.length} stores`;
    document.querySelector("#footer-updated").textContent = `Next update ${dateFormat.format(next)}`;
  }

  function renderCategories() {
    const categories = ["All", ...new Set(groceryItems.map((item) => item.category))];
    categoryFilter.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    categoryFilter.value = "All";
  }

  function renderTableHeader() {
    tableHead.innerHTML = `
      <th scope="col">Item</th>
      ${data.stores.map((store) => `<th scope="col">${store.name}</th>`).join("")}
      <th scope="col">Best</th>
      <th scope="col">Weekly</th>
    `;
  }

  function trendLabel(value) {
    if (value === 0) return `<span>Flat</span>`;
    const className = value > 0 ? "trend-up" : "trend-down";
    const sign = value > 0 ? "+" : "";
    return `<span class="${className}">${sign}${money.format(value)}</span>`;
  }

  function rowForItem(item) {
    const lows = lowStoreIds(item);
    const bestNames = lows.map((id) => data.stores.find((store) => store.id === id).name).join(", ");
    return `
      <tr>
        <th scope="row">
          <span class="item-name">${item.name}</span>
          <span class="item-size">${item.size}</span>
        </th>
        ${data.stores.map((store) => {
          const value = item.prices[store.id];
          const lowClass = lows.includes(store.id) ? " price-low" : "";
          const missingClass = Number.isFinite(value) ? "" : " price-missing";
          return `<td class="price-cell${lowClass}${missingClass}" data-label="${store.name}">${formatPrice(value)}</td>`;
        }).join("")}
        <td data-label="Best"><span class="badge">${bestNames}</span></td>
        <td data-label="Weekly">${trendLabel(item.trend)}</td>
      </tr>
    `;
  }

  function renderTable() {
    const category = categoryFilter.value || "All";
    const filtered = groceryItems.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      return categoryMatch;
    });

    tableBody.innerHTML = filtered.length
      ? filtered.map(rowForItem).join("")
      : `<tr><td colspan="${data.stores.length + 3}">No matching prices.</td></tr>`;
  }

  function renderFuel() {
    const fuelGrid = document.querySelector("#fuel-grid");
    fuelGrid.innerHTML = fuelItems.map((item) => {
      const lows = lowFuelStationIds(item);
      return `
        <article class="fuel-card">
          <div class="fuel-card-head">
            <span>${item.name}</span>
            <small>${item.size} • ${trendLabel(item.trend)}</small>
          </div>
          <dl class="fuel-prices">
            ${data.gasStations.map((station) => {
              const lowClass = lows.includes(station.id) ? " fuel-low" : "";
              return `
                <div class="${lowClass}">
                  <dt>${station.name}</dt>
                  <dd>${formatPrice(item.prices[station.id])}</dd>
                </div>
              `;
            }).join("")}
          </dl>
        </article>
      `;
    }).join("");
  }

  renderMetadata();
  renderCategories();
  renderTableHeader();
  renderTable();
  renderFuel();

  categoryFilter.addEventListener("change", renderTable);
}());
