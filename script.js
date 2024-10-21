let gameCharacters = {};
let teamComps = {};
let currentGame = null;

// Element Colors
const elementColors = {
    'Pyro': '#EC4923',
    'Hydro': '#00BFFF',
    'Anemo': '#359697',
    'Electro': '#945dc4',
    'Dendro': '#608a00',
    'Cryo': '#4682B4',
    'Geo': '#debd6c'
};

// Function to sort characters by Latest
function sortCharactersByLatest(characters) {
    return characters.sort((a, b) => b.id - a.id);
}

// Function to read JSON file
async function readJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error reading JSON:', error);
        throw error;
    }
}

// Function to initialize the page
async function init() {
    try {
        gameCharacters = await readJSON('data/game_characters.json');
        // Load team compositions for each game
        for (let game of Object.keys(gameCharacters)) {
            teamComps[game] = await readJSON(`data/${game}_team_comp.json`);
        }
        populateGameNav();
        if (Object.keys(gameCharacters).length > 0) {
            selectGame(Object.keys(gameCharacters)[0]);
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Function to populate the game navigation
function populateGameNav() {
    const gameNav = document.getElementById('gameNav');
    Object.keys(gameCharacters).forEach(game => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = '#';
        // Use a shorter display name for the games
        a.textContent = game.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).split(' ').map(word => word.substring(0, 3)).join('');
        a.setAttribute('data-game', game);
        a.onclick = (e) => {
            e.preventDefault();
            selectGame(game);
        };
        li.appendChild(a);
        gameNav.appendChild(li);
    });
}

// Function to select a game
function selectGame(game) {
    currentGame = game;
    // Remove 'active' class from all nav links
    document.querySelectorAll('#gameNav .nav-link').forEach(link => link.classList.remove('active'));
    // Add 'active' class to the selected game's nav link
    const activeLink = document.querySelector(`#gameNav .nav-link[data-game="${game}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    populateCharacterFilter(game);
    displayCharacters(game);
    displayTeamCompositions(game);
}

// Function to populate the character filter
function populateCharacterFilter(game) {
    const characterFilter = document.getElementById('characterFilter');
    characterFilter.innerHTML = '<option value="">All Characters</option>';
    const sortedCharacters = sortCharactersByLatest(gameCharacters[game]);
    sortedCharacters.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = char.Name;
        characterFilter.appendChild(option);
    });
    characterFilter.onchange = () => {
        displayCharacters(game, characterFilter.value);
        displayTeamCompositions(game, characterFilter.value);
    };
}

// Function to add element icon to card
function addElementIconToCard(card, character) {
    const characterImageContainer = card.querySelector('.character-image-container');
    const elementImagePath = `img/elements/${character.Element.toLowerCase()}.png`;
    const elementDiv = document.createElement('div');
    elementDiv.className = 'character-element';
    elementDiv.innerHTML = `<img src="${elementImagePath}" alt="${character.Element}" onerror="this.style.display='none'; console.error('Failed to load element image:', this.src);">`;
    characterImageContainer.appendChild(elementDiv);
}

// Function to display characters
function displayCharacters(game, characterId = '') {
    const characterDisplay = document.getElementById('characterDisplay');

    characterDisplay.innerHTML = '';
    let filteredChars = gameCharacters[game];
    if (characterId) {
        filteredChars = filteredChars.filter(char => char.id === characterId);
    } else {
        // If no character is selected, show only the latest 5 characters
        filteredChars = sortCharactersByLatest(filteredChars).slice(0, 5);
    }
    filteredChars.forEach(char => {
        const card = createCharacterCard(char, game);
        characterDisplay.appendChild(card);
    });
}

// Function to create a team character card
function createTeamCharacterCard(character, game) {
    const card = document.createElement('div');
    card.className = 'team-character-card';
    
    // Get the selected card style
    const cardStyle = document.getElementById('cardStyleSelector').value;

    // Apply the selected style
    card.classList.add(`${cardStyle}-style`);

    card.style.backgroundColor = getElementColor(character.Element);

    const stars = '<i class="fas fa-star"></i>'.repeat(parseInt(character.Rarity));
    const elementImagePath = `img/elements/${character.Element.toLowerCase()}.png`;
    const weaponImagePath = `img/weapons/${character.Weapon.toLowerCase()}.png`;

    let specialtyImagePath = '';
    let factionImagePath = '';

    if (game === 'zenless_zone_zero') {
        console.log('Game:', game);
        console.log('Character:', character);
        specialtyImagePath = `img/specialties/${character.Specialty.toLowerCase().replace(/\s/g, '_')}.png`;
        factionImagePath = `img/factions/${character.Faction.toLowerCase().replace(/\s/g, '_')}.png`;
        console.log('Specialty Image Path:', specialtyImagePath);
        console.log('Faction Image Path:', factionImagePath);
    }

    card.innerHTML = `
        <div class="character-image-container">
            <img src="img/avatars/${character.Name.toLowerCase().replace(/\s/g, '_')}.png" alt="${character.Name}" onerror="this.src='img/avatars/default.png'">
            <div class="character-overlay">
                <h5 class="character-name" style="color: white;">${character.Name}</h5>
            </div>
            <div class="character-rarity-container">
                <div class="character-rarity" style="color: white;">${stars}</div>
            </div>
            <div class="character-info">
                <div class="character-element">
                    <img src="${elementImagePath}" alt="${character.Element}" onerror="this.style.display='none'; console.error('Failed to load element image:', this.src);">
                </div>
                <div class="character-weapon">
                    <img src="${weaponImagePath}" alt="${character.Weapon}" onerror="this.style.display='none'; console.error('Failed to load weapon image:', this.src);">
                </div>
                ${game === 'zenless_zone_zero' ? `
                    <div class="character-specialty">
                        <img src="${specialtyImagePath}" alt="${character.Specialty}" onerror="this.style.display='none'; console.error('Failed to load specialty image:', this.src);">
                    </div>
                    <div class="character-faction">
                        <img src="${factionImagePath}" alt="${character.Faction}" onerror="this.style.display='none'; console.error('Failed to load faction image:', this.src);">
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    console.log('Card Inner HTML:', card.innerHTML);
    return card;
}


// Function to get element color
function getElementColor(element) {
    return elementColors[element] || '#FFFFFF';
}

// Function to display team compositions
function displayTeamCompositions(game, characterId = '') {
    const teamCompSection = document.getElementById('teamCompSection');
    teamCompSection.innerHTML = '<h2 class="mb-4">Team Compositions</h2>';

    if (teamComps[game] && teamComps[game].team_comps) {
        let filteredComps = teamComps[game].team_comps;

        if (characterId) {
            const selectedCharacter = gameCharacters[game].find(char => char.id === characterId);
            if (selectedCharacter) {
                filteredComps = filteredComps.filter(comp => comp.characters.includes(selectedCharacter.Name));
            }
        }

        if (filteredComps.length > 0) {
            filteredComps.forEach(comp => {
                const compDiv = document.createElement('div');
                compDiv.className = 'team-comp-item mb-4';
                compDiv.innerHTML = `
                    <h4 class="mb-3">${comp.name}</h4>
                    <p class="mb-3">${comp.description}</p>
                    <div class="team-characters">
                        ${comp.characters.map(charName => {
                            const character = gameCharacters[game].find(c => c.Name === charName);
                            if (character) {
                                console.log('Creating card for:', character, 'Game:', game); // Log character and game
                                return createTeamCharacterCard(character, game).outerHTML;
                            }
                            return '';
                        }).join('')}
                    </div>
                `;
                teamCompSection.appendChild(compDiv);
            });
        } else {
            teamCompSection.innerHTML += '<p>No team compositions available for the selected character.</p>';
        }
    }
}


// Function to create a character card
function createCharacterCard(character, game) {
    const card = document.createElement('div');
    card.className = 'character-card-wrapper';

    let backgroundStyle = '';
    if (game === 'genshin_impact' && character.Element in elementColors) {
        backgroundStyle = `background-color: ${elementColors[character.Element]};`;
    }

    const stars = '<i class="fas fa-star"></i>'.repeat(character.Rarity);

    let weaponOrPathText = 'Weapon:';

    if (game === 'honkai_star_rail') {
        weaponOrPathText = 'Path:';
    }

    card.innerHTML = `
        <div class="character-card" style="${backgroundStyle}">
            <div class="character-details">
                <div>
                    <h5 class="character-name">${character.Name}</h5>
                    <div class="character-rarity">${stars}</div>
                </div>
                <div>
                    <p>Element: ${character.Element}</p>
                    <p>${weaponOrPathText} ${character.Weapon}</p>
                    ${character.Specialty ? `<p>Specialty: ${character.Specialty}</p>` : ''}
                    ${character.Faction ? `<p>Faction: ${character.Faction}</p>` : ''}
                </div>
            </div>
            <div class="character-image-container">
                <img src="img/avatars/${character.Name.toLowerCase().replace(/\s/g, '_')}.png" alt="${character.Name}" onerror="this.src='img/avatars/default.png'">
            </div>
        </div>
    `;

    return card;
}

document.getElementById('cardStyleSelector').addEventListener('change', function() {
    // Re-render all character cards with the new style
    displayCharacters(currentGame);
    displayTeamCompositions(currentGame);
});

// const exampleCharacter = {
//    Name: 'Diluc',
//    Element: 'Pyro',
//    Rarity: 5,
//    Weapon: 'Claymore'
// };

// document.body.appendChild(createTeamCharacterCard(exampleCharacter));


// const character = {
//    Name: 'Character Name',
//    Element: 'Fire',
//    Weapon: 'Sword',
//    Rarity: '5',
//    Specialty: 'Specialty Name',
//    Faction: 'Faction Name'
//};

// const game = 'zenless_zone_zero'; // Ensure this is correctly defined
// const card = createTeamCharacterCard(character, game); // Ensure both parameters are passed
// document.body.appendChild(card);

// Initialize the page
init();
