// ==UserScript==
// @name         [LSS] Fahrzeug-Umrüstungs-Manager
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Vereinfacht das Anpassen bei Löschfahrzeugen
// @author       Paul
// @match        https://www.leitstellenspiel.de/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    // Konfiguration: der Fahrzeuge
    const manualRefits = {
        90: { name: "HLF 10", water:{min:0, max:3000, init:1200}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        30: { name: "HLF 20", water:{min:0, max:4500, init:1600}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:1000, init:150} },
        1: { name: "LF 10", water:{min:0, max:3000, init:1200}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        0: { name: "LF 20", water:{min:0, max:3000, init:2000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:1000, init:150} },
        37: { name: "TSF-W", water:{min:0, max:3000, init:500}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:6}, foam:{min:0, max:400, init:150} },
        88: { name: "KLF", water:{min:0, max:3000, init:500}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:6}, foam:{min:0, max:400, init:150} },
        89: { name: "MLF", water:{min:0, max:3000, init:1000}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:6}, foam:{min:0, max:400, init:150} },
        6: { name: "LF 8/6", water:{min:0, max:3000, init:600}, pump:{min:500, max:4000, init:800}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        7: { name: "LF 20/16", water:{min:0, max:3000, init:1600}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        8: { name: "LF 10/6", water:{min:0, max:3000, init:600}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        9: { name: "LF 16-TS", water:{min:0, max:3000, init:0}, pump:{min:500, max:4000, init:1600}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        107:{ name: "LF-L", water:{min:0, max:3000, init:2000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        17: { name: "TLF 2000", water:{min:800, max:6000, init:2000}, pump:{min:500, max:4000, init:1000}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        18: { name: "TLF 3000", water:{min:800, max:6000, init:3000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        19: { name: "TLF 8/8", water:{min:800, max:6000, init:800}, pump:{min:500, max:4000, init:800}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        20: { name: "TLF 8/18", water:{min:800, max:6000, init:1800}, pump:{min:500, max:4000, init:800}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        21: { name: "TLF 16/24-Tr", water:{min:800,max:6000, init:2400}, pump:{min:500, max:4000, init:1600}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        22: { name: "TLF 16/25", water:{min:800, max:6000, init:2400}, pump:{min:500, max:4000, init:1600}, persons:{min:1, max:6, init:6}, foam:{min:0, max:1000, init:750} },
        23: { name: "TLF 16/45", water:{min:800, max:6000, init:4500}, pump:{min:500, max:4000, init:1600}, persons:{min:1, max:6, init:3}, foam:{min:0, max:1000, init:750} },
        24: { name: "TLF 20/40", water:{min:800, max:6000, init:4000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        25: { name: "TLF 20/40-SL",water:{min:800,max:6000, init:4000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:6, init:3}, foam:{min:0, max:1000, init:750} },
        26: { name: "TLF 16", water:{min:800, max:6000, init:1800}, pump:{min:500, max:4000, init:1600}, persons:{min:1, max:6, init:3}, foam:{min:0, max:400, init:150} },
        87: { name: "TLF 4000", water:{min:800, max:6000, init:4000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:6, init:3}, foam:{min:0, max:3000, init:500} },
        121:{ name: "GTLF", water:{min:6000,max:12000,init:10000}, pump:{min:0, max:4000, init:0}, persons:{min:1, max:6, init:3}, foam:{min:0, max:2500, init:1500} },
        166:{ name: "PTLF 4000", water:{min:800, max:6000, init:5000}, pump:{min:500, max:4000, init:2000}, persons:{min:1, max:6, init:2}, foam:{min:0, max:5000, init:1000} },
        75: { name: "FLF", water:{min:5000,max:12500,init:12000}, pump:{min:0, max:0, init:0}, persons:{min:3, max:3, init:3}, foam:{min:0, max:2700, init:1500} },
        84: { name: "ULF", water:{min:800, max:6000, init:5000}, pump:{min:0, max:0, init:0}, persons:{min:3, max:3, init:3}, foam:{min:0, max:4500, init:3000} },
        163:{ name: "HLF Schiene",water:{min:0, max:4500, init:1460}, pump:{min:500, max:4000, init:2400}, persons:{min:1, max:9, init:9}, foam:{min:0, max:400, init:150} },
        167:{ name: "SLF", water:{min:800, max:0, init:3500}, pump:{min:0, max:0, init:0}, persons:{min:0, max:0, init:0}, foam:{min:0, max:20000, init:5000} },
        168:{ name: "Anh SLF", water:{min:0, max:0, init:0}, pump:{min:0, max:0, init:0}, persons:{min:0, max:0, init:0}, foam:{min:0, max:400, init:250} },
        169:{ name: "AB SLF", water:{min:0, max:0, init:0}, pump:{min:0, max:0, init:0}, persons:{min:0, max:0, init:0}, foam:{min:0, max:15000, init:10000} },
        170:{ name: "AB Wasser/Schaum", water:{min:800,max:6000, init:3000}, pump:{min:0, max:0, init:0}, persons:{min:0, max:0, init:0}, foam:{min:0, max:7500, init:5000} }
    };
    function fmt(n){ return (typeof n === 'number' && isFinite(n)) ? new Intl.NumberFormat('de-DE').format(n) : n; }


    function addMenuButton() {
        const profileMenu = document.querySelector('#menu_profile + .dropdown-menu');
        if (!profileMenu) return;
        if (profileMenu.querySelector('#open-refit-helper')) return;

        const li = document.createElement('li');
        li.setAttribute('role','presentation');
        li.innerHTML = `<a href="#" id="open-refit-helper"><span class="glyphicon glyphicon-wrench"></span>&nbsp;&nbsp; Fahrzeug-Umrüstungs-Manager</a>`;
        const divider = profileMenu.querySelector('li.divider');
        if (divider) profileMenu.insertBefore(li, divider);
        else profileMenu.appendChild(li);
        li.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); openLightbox(); });
    }

    //Lightbox

    function createLightboxIfNeeded() {
        if (document.getElementById('refit-lightbox')) return;

        const css = `
            #refit-lightbox { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:flex-start; z-index:10000; padding-top:40px; }
            #refit-lightbox .content { background: var(--background-color,#fff); color: var(--text-color,#000); border-radius:8px; width:95%; max-width:1400px; max-height:90vh; overflow:auto; padding:18px; box-shadow:0 6px 30px rgba(0,0,0,0.3); }
            #refit-lightbox h2 { margin-top:0; }
            #refit-lightbox table { width:100%; border-collapse:collapse; font-size:13px; }
            #refit-lightbox th, #refit-lightbox td { border:1px solid #ddd; padding:6px; text-align:center; vertical-align:middle; }
            .refit-slider { width:150px; }
            .refit-input { width:80px; text-align:center; }
            .refit-btn { padding:6px 8px; margin:2px; border-radius:4px; cursor:pointer; }
            .refit-credit { background:#28a745; color:white; border:none; }
            .refit-coins  { background:#dc3545; color:white; border:none; }
            .refit-skip   { background:#6f42c1; color:white; border:none; }
            .search-input { width:300px; padding:6px; margin-bottom:8px; }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);

        const lightbox = document.createElement('div');
        lightbox.id = 'refit-lightbox';
        lightbox.style.display = 'none';
        lightbox.innerHTML = `
            <div class="content">
                <button id="close-refit" style="float:right; background-color:red; color:white;">Schließen</button>
                <h2>Fahrzeug-Umrüstungs-Manager</h2>
                <div>
                    <input id="refit-search" class="search-input" placeholder="🔍 Suche Fahrzeug oder Typen">
                    <button id="refresh-refits" style="background-color:green; color:white;" class="refit-btn">Aktualisieren</button>
                </div>
                <!-- Bulk-Bar -->
               <div id="bulk-bar" style="margin:10px 0;padding:8px;border:1px solid #ddd;background:black;">
               <label>Fahrzeugtyp:</label>
               <select id="bulk-type"></select>
               <label>Wasser:</label><input type="number" id="bulk-water" class="refit-input" value="0">
               <label>Pumpe:</label><input type="number" id="bulk-pump" class="refit-input" value="0">
               <label>Pers.:</label><input type="number" id="bulk-pers" class="refit-input" value="0">
               <label>Schaum:</label><input type="number" id="bulk-foam" class="refit-input" value="0"><br>
               <button id="bulk-type-credits" style="background-color:green; color:white;" class="refit-btn refit-credit">Alle dieses Typs umbauen (Credits)</button>
               <button id="bulk-type-coins" style="background-color:red; color:white;" class="refit-btn refit-coins">Alle dieses Typs umbauen & überspringen</button>
               <button id="bulk-selected-credits" style="background-color:green; color:white;" class="refit-btn refit-credit">Ausgewählte umbauen (Credits)</button>
               <button id="bulk-selected-coins" style="background-color:red; color:white;" class="refit-btn refit-skip">Ausgewählte umbauen & überspringen</button>
               </div>

               <div id="refit-list">Fahrzeuge werden geladen!</div>
            </div>
        `;
        document.body.appendChild(lightbox);

        document.getElementById('close-refit').addEventListener('click', () => {
            document.getElementById('refit-lightbox').style.display = 'none';
        });
        document.getElementById('refresh-refits').addEventListener('click', () => fetchVehiclesAndRender());
        document.getElementById('refit-search').addEventListener('input', (e) => filterTable(e.target.value));
    }


    // Open Lightbox 

    function openLightbox() {
        createLightboxIfNeeded();
        document.getElementById('refit-lightbox').style.display = 'flex';
        fetchVehiclesAndRender();
        fillBulkTypeSelect();
    }

    let vehiclesData = [];
    async function fetchVehiclesAndRender() {
        const list = document.getElementById('refit-list');
        list.innerHTML = 'Fahrzeuge werden geladen!';

        try {
            const res = await fetch('https://www.leitstellenspiel.de/api/vehicles');
            if (!res.ok) throw new Error('Fehler beim Laden der Fahrzeuge');
            const data = await res.json();
            vehiclesData = data;
            renderTable(data);
        } catch (err) {
            console.error(err);
            list.innerHTML = 'Fehler beim Laden der Fahrzeuge. Öffne Konsole für Details.';
        }
    }

// Popup
async function niceConfirm(message) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = 10001;

        modal.innerHTML = `
            <div style="background:black; padding:20px; border-radius:8px; max-width:400px; text-align:center;">
                <p>${message.replace(/\n/g, '<br>')}</p>
                <button id="nice-confirm-ok" style="margin:5px; padding:6px 12px; background:#28a745; color:#fff; border:none; border-radius:4px;">OK</button>
                <button id="nice-confirm-cancel" style="margin:5px; padding:6px 12px; background:#dc3545; color:#fff; border:none; border-radius:4px;">Abbrechen</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#nice-confirm-ok').onclick = () => { modal.remove(); resolve(true); };
        modal.querySelector('#nice-confirm-cancel').onclick = () => { modal.remove(); resolve(false); };
    });
}

    function renderTable(vehicles) {
        const list = document.getElementById('refit-list');
        list.innerHTML = '';

        vehicles = vehicles.filter(v => v.fms_real == 2 && v.fms_show == 2);
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th><input type="checkbox" id="check-all"></th>
                    <th>Fahrzeug</th>
                    <th>Typ</th>
                    <th>Wasser (L)</th>
                    <th>Pumpe (L/min)</th>
                    <th>Personal</th>
                    <th>Sonderlöschmittel (L)</th>
                    <th>Aktion</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        vehicles.forEach(vehicle => {
            const cfg = manualRefits[vehicle.vehicle_type];
            if (!cfg) return;

            const tr = document.createElement('tr');
            tr.dataset.vehicleId = vehicle.id;
            tr.dataset.vehicleType = vehicle.vehicle_type;

            const tdCheck = document.createElement('td');
            tdCheck.innerHTML = `<input type="checkbox" class="row-check" data-id="${vehicle.id}">`;
            tr.appendChild(tdCheck);

            // Fahrzeug Caption
            const cellName = document.createElement('td');
            cellName.textContent = vehicle.caption || `${cfg.name} (${vehicle.id})`;
            tr.appendChild(cellName);

            // Typ
            const cellType = document.createElement('td');
            cellType.textContent = cfg.name;
            tr.appendChild(cellType);

          // WATER
const cellWater = document.createElement('td');

if (cfg.water.values && Array.isArray(cfg.water.values) && cfg.water.values.length > 0) {
    const values = cfg.water.values;

    let waterVal = (typeof vehicle.custom_water_amount === 'number')
        ? vehicle.custom_water_amount
        : cfg.water.init;

    let startIndex = values.indexOf(waterVal);
    if (startIndex === -1) startIndex = 0;

    const wSlider = document.createElement('input');
    wSlider.type = 'range';
    wSlider.className = 'refit-slider';
    wSlider.min = 0;
    wSlider.max = values.length - 1;
    wSlider.step = 250;
    wSlider.value = startIndex;

    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.className = 'refit-input';
    wInput.value = values[startIndex];

    wSlider.addEventListener('input', () => {
        const val = values[wSlider.value];
        wInput.value = val;
    });

    wInput.addEventListener('change', () => {
        const num = Number(wInput.value);
        let idx = values.indexOf(num);
        if (idx === -1) {
            let closest = values.reduce((a, b) => Math.abs(b - num) < Math.abs(a - num) ? b : a);
            idx = values.indexOf(closest);
            wInput.value = closest;
        }
        wSlider.value = idx;
    });

    cellWater.appendChild(wSlider);
    cellWater.appendChild(document.createElement('br'));
    cellWater.appendChild(wInput);

} else {
    const wSlider = document.createElement('input');
    wSlider.type = 'range';
    wSlider.className = 'refit-slider';
    wSlider.min = cfg.water.min ?? 0;
    wSlider.max = cfg.water.max ?? (cfg.water.min ?? 0);

    const waterVal = (typeof vehicle.custom_water_amount === 'number')
        ? vehicle.custom_water_amount
        : cfg.water.init;

    wSlider.value = waterVal;

    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.className = 'refit-input';
    wInput.min = wSlider.min;
    wInput.max = wSlider.max;
    wInput.value = waterVal;

    syncSliderWithInput(wSlider, wInput);

    cellWater.appendChild(wSlider);
    cellWater.appendChild(document.createElement('br'));
    cellWater.appendChild(wInput);
}

tr.appendChild(cellWater);





    // Pumpe
    const cellPump = document.createElement('td');
    const pSlider = document.createElement('input');
          pSlider.type = 'range';
          pSlider.className = 'refit-slider';
          pSlider.min = cfg.pump.min;
          pSlider.max = cfg.pump.max || cfg.pump.min;
          pSlider.step = 250;

const pumpVal = (typeof vehicle.custom_pump_amount === 'number')
    ? vehicle.custom_pump_amount
    : cfg.pump.init;

pSlider.value = pumpVal;

const pInput = document.createElement('input');
pInput.type = 'number';
pInput.className = 'refit-input';
pInput.min = cfg.pump.min;
pInput.max = cfg.pump.max || cfg.pump.min;
pInput.value = pumpVal;

syncSliderWithInput(pSlider, pInput);

cellPump.appendChild(pSlider);
cellPump.appendChild(document.createElement('br'));
cellPump.appendChild(pInput);

tr.appendChild(cellPump);


            // PERSONS
const cellPersons = document.createElement('td');
const pplSlider = document.createElement('input');
pplSlider.type = 'range';
pplSlider.className = 'refit-slider';
pplSlider.min = cfg.persons.min;
pplSlider.max = cfg.persons.max || cfg.persons.min;

const persVal = (typeof vehicle.custom_personal_max === 'number')
    ? vehicle.custom_personal_max
    : cfg.persons.init;

pplSlider.value = persVal;

const pplInput = document.createElement('input');
pplInput.type = 'number';
pplInput.className = 'refit-input';
pplInput.min = cfg.persons.min;
pplInput.max = cfg.persons.max || cfg.persons.min;
pplInput.value = persVal;

syncSliderWithInput(pplSlider, pplInput);

cellPersons.appendChild(pplSlider);
cellPersons.appendChild(document.createElement('br'));
cellPersons.appendChild(pplInput);

tr.appendChild(cellPersons);


            // Schaum
const cellFoam = document.createElement('td');
const fSlider = document.createElement('input');
fSlider.type = 'range';
fSlider.className = 'refit-slider';
fSlider.min = cfg.foam.min;
fSlider.max = cfg.foam.max || cfg.foam.min;
            fSlider.step = 50;

const foamVal = (typeof vehicle.custom_foam_amount === 'number')
    ? vehicle.custom_foam_amount
    : cfg.foam.init;

fSlider.value = foamVal;

const fInput = document.createElement('input');
fInput.type = 'number';
fInput.className = 'refit-input';
fInput.min = cfg.foam.min;
fInput.max = cfg.foam.max || cfg.foam.min;
fInput.value = foamVal;

syncSliderWithInput(fSlider, fInput);

cellFoam.appendChild(fSlider);
cellFoam.appendChild(document.createElement('br'));
cellFoam.appendChild(fInput);

tr.appendChild(cellFoam);




            // Aktion Buttons
            const cellAction = document.createElement('td');

            const btnCredits = document.createElement('button');
            btnCredits.className = 'refit-btn refit-credit';
            btnCredits.textContent = 'Umbau (Credits)';
            btnCredits.addEventListener('click', async () => {
    const values = readValuesFromRow(tr);
    if (!validateValues(cfg, values)) { alert('Wert außerhalb erlaubter Grenzen'); return; }
    const ok = await niceConfirm(
        `Umbau von "${vehicle.caption}" starten?\nWasser: ${values.water}\nPumpe: ${values.pump}\nPersonal: ${values.persons}\nSonderlöschmittel: ${values.foam}`
    );
    if (!ok) return;
    refitVehicle(vehicle.id, values, 'credits');



                refitVehicle(vehicle.id, values, 'credits');
            });
            cellAction.appendChild(btnCredits);

            const btnCoins = document.createElement('button');
            btnCoins.className = 'refit-btn refit-coins';
            btnCoins.textContent = 'Umbau & Überspringen (6 Coins)';
            btnCoins.addEventListener('click', async () => {
                const values = readValuesFromRow(tr);
                if (!validateValues(cfg, values)) { alert('Wert außerhalb erlaubter Grenzen'); return; }
                if (!confirm(`Umbau & Überspringen (6 Coins) von "${vehicle.caption}" starten?\nWasser: ${values.water}\nPumpe: ${values.pump}\nPersonal: ${values.persons}\nSonderlöschmittel: ${values.foam}`)) return;
                const ok = await refitVehicle(vehicle.id, values, 'credits', true); // returns true on success
                if (ok) {
                    await skipRefitWithCoins(vehicle.id, 6);
                }
            });
            cellAction.appendChild(document.createElement('br'));
            cellAction.appendChild(btnCoins);

            tr.appendChild(cellAction);
            tbody.appendChild(tr);
        });

        list.appendChild(table);
        document.getElementById('check-all').onchange = e => {
            tbody.querySelectorAll('.row-check').forEach(c => {
                const row = c.closest('tr');
                if (row.style.display !== 'none') {
                    c.checked = e.target.checked;
                }
            });
        };

    }

    function syncSliderWithInput(slider, input) {
        slider.addEventListener('input', () => { input.value = slider.value; });
        input.addEventListener('change', () => {
            let v = Number(input.value);
            if (isNaN(v)) v = Number(slider.min);
            if (v < Number(slider.min)) v = Number(slider.min);
            if (v > Number(slider.max)) v = Number(slider.max);
            input.value = v;
            slider.value = v;
        });
    }

    function readValuesFromRow(tr) {
        const inputs = tr.querySelectorAll('input.refit-input');
        // order: water, pump, persons, foam
        return {
            water: Number(inputs[0].value),
            pump: Number(inputs[1].value),
            persons: Number(inputs[2].value),
            foam: Number(inputs[3].value)
        };
    }

    function validateValues(cfg, values) {
        if (values.water < cfg.water.min || (cfg.water.max !== undefined && cfg.water.max !== Infinity && values.water > cfg.water.max)) return false;
        if (values.pump < cfg.pump.min || (cfg.pump.max !== undefined && cfg.pump.max !== Infinity && values.pump > cfg.pump.max)) return false;
        if (values.persons < cfg.persons.min || (cfg.persons.max !== undefined && cfg.persons.max !== Infinity && values.persons > cfg.persons.max)) return false;
        if (values.foam < cfg.foam.min || (cfg.foam.max !== undefined && cfg.foam.max !== Infinity && values.foam > cfg.foam.max)) return false;
        return true;
    }

    function filterTable(term) {
        const q = term.trim().toLowerCase();
        document.querySelectorAll('#refit-list tbody tr').forEach(tr => {
            const s = (tr.cells[0].textContent + ' ' + tr.cells[1].textContent + ' ' + tr.cells[2].textContent).toLowerCase();
            tr.style.display = s.includes(q) ? '' : 'none';
        });
    }

    function getCSRF() {
        const m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.getAttribute('content') : '';
    }

    function refitVehicle(vehicleId, values, currency = 'credits', returnOnSuccess = false) {
    // Setze Platzhaltername für das Pflichtfeld "Name der Umrüstung"
    const csrf = getCSRF();
    const url = `/refit_vehicle/${vehicleId}`;
    const placeholderName = "\u200B\u200C\u200D";
    const body =
          `vehicle_fitting_template[template_caption]=${encodeURIComponent(placeholderName)}&` +
          `vehicle_fitting_template[id]=&` + 
          `persons=${encodeURIComponent(values.persons)}&` +
          `water=${encodeURIComponent(values.water)}&` +
          `pump=${encodeURIComponent(values.pump)}&` +
          `foam=${encodeURIComponent(values.foam)}&` +
          `currency=${encodeURIComponent(currency)}`;

    return new Promise((resolve) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: url,
            headers: {
                'X-CSRF-Token': csrf,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data: body,
            onload: function(resp) {
                if (resp.status >= 200 && resp.status < 300) {
                    const tr = document.querySelector(`#refit-list tbody tr[data-vehicle-id="${vehicleId}"]`);
                    if (tr) { tr.style.opacity = '0.5'; }
                    resolve(true);
                } else {
                    console.error('Refit Fehler', resp);
                    try {
                        const responseJson = JSON.parse(resp.responseText);
                        console.error('Response Details:', responseJson);
                    } catch (e) {
                        console.error('Keine JSON-Antwort oder Parsing-Fehler');
                    }
                    alert('Fehler beim Starten des Umbaus (HTTP ' + resp.status + '). Konsole anschauen.', '#dc3545');
                    resolve(false);
                }
            },
            onerror: function(err) {
                console.error('Request error', err);
                alert('Netzwerkfehler beim Starten des Umbaus.', '#dc3545');
                resolve(false);
            }
        });
    });
}



    async function skipRefitWithCoins(vehicleId, coinsAmount = 6) {
        const csrf = getCSRF();
        const url = `/vehicles/${vehicleId}/refit/skip`;
        const body = `coins=${encodeURIComponent(coinsAmount)}`;
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: url,
                headers: {
                    'X-CSRF-Token': csrf,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: body,
                onload: function(resp) {
                    if (resp.status >= 200 && resp.status < 300) {
                        alert('Umbau übersprungen mit ' + coinsAmount + ' Coins (Antwort ' + resp.status + ').');
                        resolve(true);
                    } else {
                        console.error('Skip error', resp);
                        alert('Fehler beim Überspringen (HTTP ' + resp.status + ').');
                        resolve(false);
                    }
                },
                onerror: function(err) {
                    console.error('Skip request error', err);
                    alert('Netzwerkfehler beim Überspringen.');
                    resolve(false);
                }
            });
        });
    }

    function getStationName(vehicle) {
        if (vehicle.building_id && window.__INITIAL_STATE__ && window.__INITIAL_STATE__.buildings) {
            const b = window.__INITIAL_STATE__.buildings[vehicle.building_id];
            if (b && b.caption) return b.caption;
        }
        return 'Unbekannte Leitstelle';
    }

    addMenuButton();

    const observer = new MutationObserver(() => addMenuButton());
    observer.observe(document.body, { childList: true, subtree: true });

    // === Bulk-Funktionen ===
function getBulkValues(){
    return {
        water:+document.getElementById('bulk-water').value,
        pump:+document.getElementById('bulk-pump').value,
        persons:+document.getElementById('bulk-pers').value,
        foam:+document.getElementById('bulk-foam').value
    };
}

async function bulkByType(skip=false){
    const type=document.getElementById('bulk-type').value;
    const vals=getBulkValues();
    const same=vehiclesData.filter(v=>v.vehicle_type==type);

    const okConfirm = await niceConfirm(`Willst du wirklich ${same.length} Fahrzeuge dieses Typs umbauen?`);
    if (!okConfirm) return;

    let ok=0;
    for(const v of same){
        const started=await refitVehicle(v.id,vals);
        if(started){ ok++; if(skip) await skipRefitWithCoins(v.id); }
    }
    console.log(`Umbau ${ok}/${same.length} Fahrzeuge gestartet${skip?' & übersprungen':''}.`);
}

async function bulkSelected(skip=false){
    const ids=[...document.querySelectorAll('.row-check:checked')].map(c=>+c.dataset.id);

    const okConfirm = await niceConfirm(`Willst du wirklich ${ids.length} ausgewählte Fahrzeuge umbauen?`);
    if (!okConfirm) return;

    let ok=0;
    for(const id of ids){
        const tr=document.querySelector(`#refit-list tbody tr[data-vehicle-id="${id}"]`);
        if(!tr) continue;
        const values=readValuesFromRow(tr);
        const started=await refitVehicle(id,values);
        if(started){ ok++; if(skip) await skipRefitWithCoins(id); }
    }
    console.log(`Umbau ${ok}/${ids.length} Fahrzeuge gestartet${skip?' & übersprungen':''}.`);
}

function fillBulkTypeSelect(){
    const sel=document.getElementById('bulk-type');
    sel.innerHTML='';
    Object.entries(manualRefits).forEach(([id,cfg])=>{
        const opt=document.createElement('option');
        opt.value=id;
        opt.textContent=cfg.name;
        sel.appendChild(opt);
    });

    if(sel.options.length > 0){
        applyBulkLimits(sel.value);
    }

    sel.addEventListener('change', e=>{
        applyBulkLimits(e.target.value);
    });
}
function applyBulkLimits(typeId){
    const cfg = manualRefits[typeId];
    if(!cfg) return;

    const w=document.getElementById('bulk-water');
    w.min = cfg.water.min;
    w.max = cfg.water.max;
    w.value = cfg.water.init;

    const p=document.getElementById('bulk-pump');
    p.min = cfg.pump.min;
    p.max = cfg.pump.max;
    p.value = cfg.pump.init;

    const per=document.getElementById('bulk-pers');
    per.min = cfg.persons.min;
    per.max = cfg.persons.max;
    per.value = cfg.persons.init;

    const f=document.getElementById('bulk-foam');
    f.min = cfg.foam.min;
    f.max = cfg.foam.max;
    f.value = cfg.foam.init;
}

document.addEventListener('click',e=>{
    if(e.target.id==='bulk-type-credits') bulkByType(false);
    if(e.target.id==='bulk-type-coins') bulkByType(true);
    if(e.target.id==='bulk-selected-credits') bulkSelected(false);
    if(e.target.id==='bulk-selected-coins') bulkSelected(true);
});

})();

