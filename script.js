const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const cryptoContainer = document.getElementById("crypto-container");
const comparisonContainer = document.getElementById("comparison-container");
const selectedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
const sortByMarketCapCheckbox = document.getElementById("sort-by-market-cap");

async function fetchCryptos() {
    try {
        const response = await fetch(`${API_URL}?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false`);
        const data = await response.json();
        renderCryptos(data);
    } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
    }
}

function renderCryptos(cryptos) {
    cryptoContainer.innerHTML = "";
    cryptos.forEach(crypto => {
        const cryptoBox = document.createElement('div');
        cryptoBox.classList.add('crypto-box');
        cryptoBox.innerHTML = `
        <div style="background-color: rgb(27, 27, 27); padding: 20px;border-radius: 100%; position: absolute; top: -20px; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center;">
        <img style=" width: 50px; height: 50px; border-radius: 100%;" src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
            </div>
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p>Price: $${crypto.current_price}</p>
            <button style="padding: 15px; border-radius: 10px; align-items: center;" data-id="${crypto.id}" class="compare-btn">Add to Compare</button>
        `;
        const compareButton = cryptoBox.querySelector('.compare-btn');
        compareButton.addEventListener('click', () => toggleComparison(crypto));
        cryptoContainer.appendChild(cryptoBox);
    });
}

function toggleComparison(crypto) {
    if (selectedCryptos.find(c => c.id === crypto.id)) {
        alert(`${crypto.name} is already selected for comparison.`);
        return;
    }

    if (selectedCryptos.length < 5) {
        selectedCryptos.push(crypto);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonTable();
    } else {
        alert("You can only compare up to 5 cryptocurrencies.");
    }
}

function updateComparisonTable() {
    comparisonContainer.innerHTML = ''; 

    if (selectedCryptos.length === 0) {
        comparisonContainer.innerHTML = "<p>No cryptocurrencies selected for comparison.</p>";
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Market Cap</th>
                <th>24hr Low</th>
                <th>24hr High</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${selectedCryptos.map(crypto => `
                <tr>
                    <td>
                        <img src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
                        ${crypto.name} (${crypto.symbol.toUpperCase()})
                    </td>
                    <td>$${crypto.current_price}</td>
                    <td>${crypto.market_cap}</td>
                    <td>${crypto.low_24h}</td>
                    <td>${crypto.high_24h}</td>
                    <td><button class="remove-btn" data-id="${crypto.id}">Remove</button></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    comparisonContainer.appendChild(table);

    const removeButtons = comparisonContainer.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => removeFromComparison(button.dataset.id));
    });
}

function removeFromComparison(cryptoId) {
    const index = selectedCryptos.findIndex(c => c.id === cryptoId);
    if (index !== -1) {
        selectedCryptos.splice(index, 1);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonTable();
    }
}

sortByMarketCapCheckbox.addEventListener("change", () => {
    if (sortByMarketCapCheckbox.checked) {
        sortCryptosByMarketCap();
    } else {
        fetchCryptos();
    }
});

function sortCryptosByMarketCap() {
    fetch(`${API_URL}?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`)
        .then(response => response.json())
        .then(data => data.sort((a, b) => b.market_cap - a.market_cap))
        .then(sortedData => renderCryptos(sortedData))
        .catch(error => console.error("Error sorting data:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCryptos();
    updateComparisonTable();
});
