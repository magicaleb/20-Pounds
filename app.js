const STORAGE_KEY = "calorieQuickLog.v1";
const defaults = { target: 2200, theme: "light", entries: [] };
const types = ["Breakfast", "Lunch", "Dinner", "Snack"];
const categories = [
  { id: "sweet", name: "Sweet", hint: "candy, cookies, dessert", color: "#ff4d6d" },
  { id: "fast", name: "Fast food", hint: "burgers, dogs, fries", color: "#ef4444" },
  { id: "bread", name: "Bread", hint: "sandwiches, toast, pastries", color: "#eab308" },
  { id: "bowl", name: "Bowl", hint: "rice, burrito, grain bowls", color: "#06b6d4" },
  { id: "protein", name: "Protein", hint: "meat, eggs, chicken", color: "#10b981" },
  { id: "snack", name: "Snack", hint: "chips, nuts, small items", color: "#8b5cf6" },
  { id: "breakfast", name: "Breakfast", hint: "eggs, cereal, pancakes", color: "#ec4899" },
  { id: "mixed", name: "Mixed meal", hint: "plate, combo, leftovers", color: "#14b8a6" }
];
const foods = [
  { name: "Twix bar", cal: 250, comps: ["1 candy bar", "2 fun-size bars", "small cookie + chocolate", "palm-length snack"], cats: ["sweet", "snack"] },
  { name: "Spaghetti", cal: 600, comps: ["2 fists pasta", "full plate mound", "large cereal bowl", "takeout side tray"], cats: ["mixed"] },
  { name: "Hotdog and fries", cal: 740, comps: ["hotdog + medium fries", "small combo tray", "handheld + side", "full paper plate"], cats: ["fast", "mixed"] },
  { name: "Cheeseburger", cal: 650, comps: ["1 cheeseburger", "large sandwich with cheese", "burger + small snack", "fist-size item"], cats: ["fast", "bread", "protein"] },
  { name: "Chicken breast", cal: 280, comps: ["palm-size breast", "deck-of-cards thickness", "medium fillet", "one hand-size piece"], cats: ["protein"] },
  { name: "Pancakes", cal: 520, comps: ["3 medium pancakes", "short stack", "breakfast plate", "palm-wide stack"], cats: ["breakfast", "sweet", "bread"] },
  { name: "Chips", cal: 300, comps: ["2 handfuls", "small bag", "loose cereal bowl", "snack pile"], cats: ["snack"] },
  { name: "Restaurant plate", cal: 900, comps: ["full sit-down entree", "full dinner plate", "main + side", "large plate"], cats: ["mixed"] }
];
const portionOptions = [{ name: "Less", hint: "Smaller than reference", multiplier: .75 }, { name: "Same", hint: "About the same", multiplier: 1 }, { name: "More", hint: "Bigger serving", multiplier: 1.25 }, { name: "A lot", hint: "Very large / extra", multiplier: 1.6 }];
const state = { data: loadData(), selectedCategories: new Set(), query: "", selectedFood: null, selectedPortion: portionOptions[1], calorieAdjust: 0, editingId: null, lastDeleted: null, showAll: false, toastTimer: null };
const els = Object.fromEntries([...document.querySelectorAll('[id]')].map(n => [n.id, n]));
function cloneDefaults(){return{target:defaults.target,theme:defaults.theme,entries:[]};}
function makeId(){return crypto?.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function todayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function loadData(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!s||typeof s!=="object")return cloneDefaults();return{target:Math.max(1,Math.round(Number(s.target||defaults.target))),theme:s.theme==="dark"?"dark":"light",entries:Array.isArray(s.entries)?s.entries:[]};}catch{return cloneDefaults();}}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.data));}
const el=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n;};
const currentCalories=()=>Number(els.manualCalories.value)>0?Math.round(Number(els.manualCalories.value)):!state.selectedFood?0:Math.max(0,Math.round((state.selectedFood.cal*state.selectedPortion.multiplier+state.calorieAdjust)/25)*25);
function setStep(step){document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));document.getElementById(step==='filters'?'stepFilters':step==='search'?'stepSearch':'stepPortion').classList.add('active');}
function setPage(page){const d=page==='dashboard';els.entryPage.classList.toggle('active',!d);els.dashboardPage.classList.toggle('active',d);els.entryTab.classList.toggle('active',!d);els.dashboardTab.classList.toggle('active',d)}
function renderTheme(){document.documentElement.dataset.theme=state.data.theme;els.themeToggle.textContent=state.data.theme==='dark'?'☀':'☾';}
function renderCategories(){els.categoryGrid.replaceChildren();categories.forEach(c=>{const b=el('button','food-block'+(state.selectedCategories.has(c.id)?' active':''));b.type='button';b.append(el('span','',c.name),el('small','',c.hint));b.onclick=()=>{state.selectedCategories.has(c.id)?state.selectedCategories.delete(c.id):state.selectedCategories.add(c.id);renderCategories();renderSearch();};els.categoryGrid.appendChild(b);});}
function renderSearch(){els.resultsList.replaceChildren();foods.filter(f=>(!state.selectedCategories.size||[...state.selectedCategories].some(id=>f.cats.includes(id)))&&(!state.query||f.name.toLowerCase().includes(state.query.toLowerCase()))).forEach(f=>{const b=el('button','result-card');b.type='button';b.append(el('strong','',f.name),el('div','',`${f.cal}`));b.onclick=()=>{state.selectedFood=f;state.selectedPortion=portionOptions[1];state.calorieAdjust=0;els.manualCalories.value='';renderPortion();setStep('portion');};els.resultsList.appendChild(b);});}
function renderPortion(){if(!state.selectedFood)return;els.selectedFoodName.textContent=state.selectedFood.name;els.selectedCalories.textContent=currentCalories();els.portionGrid.replaceChildren();portionOptions.forEach(o=>{const b=el('button','portion-card'+(state.selectedPortion===o?' active':''),o.name);b.onclick=()=>{state.selectedPortion=o;renderPortion();};els.portionGrid.appendChild(b);});}
function render(){renderTheme();renderCategories();renderSearch();renderPortion();}
function addEntry(){const calories=currentCalories();if(!state.selectedFood||!calories)return;const now=new Date();state.data.entries.push({id:makeId(),calories,type:'Snack',food:state.selectedFood.name,note:els.noteInput.value.trim(),portion:state.selectedPortion.name,createdAt:now.toISOString(),dateKey:todayKey(now)});saveData();}
function bind(){els.entryTab.onclick=()=>setPage('entry');els.dashboardTab.onclick=()=>setPage('dashboard');els.toSearchButton.onclick=()=>setStep('search');els.backToFilters.onclick=()=>setStep('filters');els.backToSearch.onclick=()=>setStep('search');els.foodSearch.oninput=()=>{state.query=els.foodSearch.value;renderSearch();};document.querySelectorAll('.adjust-btn').forEach(btn=>btn.onclick=()=>{state.calorieAdjust+=Number(btn.dataset.adjust);renderPortion();});els.manualCalories.oninput=renderPortion;els.addButton.onclick=addEntry;els.themeToggle.onclick=()=>{state.data.theme=state.data.theme==='dark'?'light':'dark';saveData();renderTheme();};}
bind();render();
