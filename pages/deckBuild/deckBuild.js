////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const PROJECT_ROOT_PATH = "../../"
const HERO_RACE_LIST = ['iop', 'xelor', 'cra']
const HERO_CLASSES = 5
const ELEMS = ['fire', 'water', 'earth', 'air', 'neutral']
const SPELLS_BY_ELEM = 10
const COMPANIONS_BY_ELEM = 10
const DECK_SPELLS = 9
const DECK_COMPANIONS = 4

// Available choiceDisplayed : HERO, SPELL, COMPANION
var choiceDisplayed         = "HERO"
var heroesDataBase          = {}
var entitiesDataBase        = {}
var spellsDataBase          = {}
var companionsDataBase      = {}
var selectedHero            = "h0"
var selectedSpellList       = ["sh0"]
var selectedCompanionList   = []
var tooltipArray            = []

$.when(getHeroesDataBase(), getEntitiesDataBase(), getSpellsDataBase(), getCompanionsDataBase()).then(loadPage)

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getHeroesDataBase()
{
    return $.getJSON(PROJECT_ROOT_PATH + "data/heroes.json", function(data) {heroesDataBase = data});
}

function getEntitiesDataBase()
{
    return $.getJSON(PROJECT_ROOT_PATH + "data/entities.json", function(data) {entitiesDataBase = data});
}

function getSpellsDataBase()
{
    return $.getJSON(PROJECT_ROOT_PATH + "data/spells.json", function(data) {spellsDataBase = data});
}

function getCompanionsDataBase()
{
    return $.getJSON(PROJECT_ROOT_PATH + "data/companions.json", function(data) {companionsDataBase = data});
}

function removeTooltips()
{
    for(i = 0; i < tooltipArray.length; i++)
    {
        tooltipArray[i].destructor()
    }
    tooltipArray = [];
}

function loadPage()
{
    cleanPage();
    removeTooltips();
    if (choiceDisplayed == "HERO")
    {
        $("#heroBtn").css("background-color", "#FF0000");
        $("#spellBtn").css("background-color", "#0000FF");
        $("#companionBtn").css("background-color", "#0000FF");
        heroChoice();
    }
    else if (choiceDisplayed == "SPELL")
    {
        $("#heroBtn").css("background-color", "#0000FF");
        $("#spellBtn").css("background-color", "#FF0000");
        $("#companionBtn").css("background-color", "#0000FF");
        spellChoice();
    }
    else if (choiceDisplayed == "COMPANION")
    {
        $("#heroBtn").css("background-color", "#0000FF");
        $("#spellBtn").css("background-color", "#0000FF");
        $("#companionBtn").css("background-color", "#FF0000");
        companionChoice();
    }
    heroBarDisplay();
    spellBarDisplay();
    companionBarDisplay();
    validateBtnDisplay();
}

function cleanPage()
{
    document.getElementById("choiceLayout").removeChild(document.getElementById("choiceGrid"));
    document.getElementById("spellBarLayout").removeChild(document.getElementById("spellBar"));
    document.getElementById("companionBarLayout").removeChild(document.getElementById("companionBar"));
}

function heroChoice()
{
    document.getElementById("choiceLayout").insertAdjacentHTML('beforeend',`<div id="choiceGrid" class="h-full"></div>`);
    $("#choiceGrid").addClass("flex-grow grid grid-cols-" + String(HERO_RACE_LIST.length) + " grid-rows-" + String(1 + HERO_CLASSES))

    for (y = 0; y < 1 + HERO_CLASSES; y++)
    {
        for (x = 0; x < HERO_RACE_LIST.length; x++)
        {
            if (y == 0)
            {
                document.getElementById("choiceGrid").insertAdjacentHTML('beforeend',`<div id="choiceGrid_${x}"></div>`);
                $("#choiceGrid_" + x).text(HERO_RACE_LIST[x]);
            }
            else
            {
                document.getElementById("choiceGrid").insertAdjacentHTML('beforeend',`<div id="choiceGrid_${x}_${y}" class="border-2 border-light-blue-500 border-opacity-25 relative bg-center bg-contain bg-no-repeat"></div>`);
                $("#choiceGrid_" + x + "_" + y).click(function() {heroChoiceClick($(this))});
                $("#choiceGrid_" + x + "_" + y).css("background-color", "#FFFFFF");
            }
        } 
    }

    for (x = 0; x < HERO_RACE_LIST.length; x++)
    {
        var y = 1;
        for (h in heroesDataBase)
        {
            if (heroesDataBase[h]["race"] == HERO_RACE_LIST[x])
            {
                $("#choiceGrid_" + x + "_" + y).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("heroesDataBase." + h + ".entityDescId") + ".descSpritePath") + ")");
                $("#choiceGrid_" + x + "_" + y).data("heroDescId", h);
                tooltipArray.push(new Tooltip(document.getElementById("choiceGrid_" + x + "_" + y), PROJECT_ROOT_PATH + eval("spellsDataBase." + eval("heroesDataBase." + h + ".spellDescId") + ".descSpritePath"), "img"));
                y = y + 1;
            }
        }
    }
}

function spellChoice()
{
    document.getElementById("choiceLayout").insertAdjacentHTML('beforeend',`<div id="choiceGrid" class="h-full"></div>`);
    $("#choiceGrid").addClass("flex-grow grid grid-cols-" + String(ELEMS.length) + " grid-rows-" + String(SPELLS_BY_ELEM))
    for (y = 0; y < SPELLS_BY_ELEM; y++)
    {
        for (x = 0; x < ELEMS.length; x++)
        {
            document.getElementById("choiceGrid").insertAdjacentHTML('beforeend',`<div id="choiceGrid_${x}_${y}" class="border-2 border-light-blue-500 border-opacity-25 relative bg-center bg-contain bg-no-repeat"></div>`);
            $("#choiceGrid_" + x + "_" + y).click(function() {spellChoiceClick($(this))});
            $("#choiceGrid_" + x + "_" + y).css("background-color", "#FFFFFF");
        } 
    }

    for (x = 0; x <ELEMS.length; x++)
    {
        var y = 0;
        for (s in spellsDataBase)
        {
            if (spellsDataBase[s]["race"] == eval("heroesDataBase." + selectedHero + ".race") && spellsDataBase[s]["elem"] == ELEMS[x])
            {
                $("#choiceGrid_" + x + "_" + y).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("spellsDataBase." + s + ".descSpritePath") + ")");
                $("#choiceGrid_" + x + "_" + y).data("spellDescId", s);
                y = y + 1;
            }
        }
    }
}

function companionChoice()
{
    document.getElementById("choiceLayout").insertAdjacentHTML('beforeend',`<div id="choiceGrid" class="h-full"></div>`);
    $("#choiceGrid").addClass("flex-grow grid grid-cols-" + String(ELEMS.length) + " grid-rows-" + String(COMPANIONS_BY_ELEM))
    for (y = 0; y < COMPANIONS_BY_ELEM; y++)
    {
        for (x = 0; x < ELEMS.length; x++)
        {
            document.getElementById("choiceGrid").insertAdjacentHTML('beforeend',`<div id="choiceGrid_${x}_${y}" class="border-2 border-light-blue-500 border-opacity-25 relative bg-center bg-contain bg-no-repeat"></div>`);
            $("#choiceGrid_" + x + "_" + y).click(function() {companionChoiceClick($(this))});
            $("#choiceGrid_" + x + "_" + y).css("background-color", "#FFFFFF");
        } 
    }

    for (x = 0; x <ELEMS.length; x++)
    {
        var y = 0;
        for (c in companionsDataBase)
        {
            if (Object.keys(companionsDataBase[c]["cost"]).length == 1 && Object.keys(companionsDataBase[c]["cost"]) == ELEMS[x])
            {
                $("#choiceGrid_" + x + "_" + y).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("companionsDataBase." + c + ".entityDescId") + ".descSpritePath") + ")");
                $("#choiceGrid_" + x + "_" + y).data("companionDescId", c);
                if (eval("companionsDataBase." + c + ".spellDescId"))
                {
                    tooltipArray.push(new Tooltip(document.getElementById("choiceGrid_" + x + "_" + y), PROJECT_ROOT_PATH + eval("spellsDataBase." + eval("companionsDataBase." + c + ".spellDescId") + ".descSpritePath"), "img"));
                }
                y = y + 1;
            }
            else if (Object.keys(companionsDataBase[c]["cost"]).length > 1 && ELEMS[x] == 'neutral')
            {
                $("#choiceGrid_" + x + "_" + y).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("companionsDataBase." + c + ".entityDescId") + ".descSpritePath") + ")");
                $("#choiceGrid_" + x + "_" + y).data("companionDescId", c);
                if (eval("companionsDataBase." + c + ".spellDescId"))
                {
                    tooltipArray.push(new Tooltip(document.getElementById("choiceGrid_" + x + "_" + y), PROJECT_ROOT_PATH + eval("spellsDataBase." + eval("companionsDataBase." + c + ".spellDescId") + ".descSpritePath"), "img"));
                }
                y = y + 1;
            }
        }
    }
}

function heroBarDisplay()
{
    $("#heroBar").css("background-image", "url(" + PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("heroesDataBase." + selectedHero + ".entityDescId") + ".spritePath") + ")")
}

function spellBarDisplay()
{
    document.getElementById("spellBarLayout").insertAdjacentHTML('beforeend',`<div id="spellBar" class="grid grid-cols-9 grid-rows-1 w-max mx-4"></div>`);
    for (i = 0; i < DECK_SPELLS; i++)
    {
        document.getElementById("spellBar").insertAdjacentHTML('beforeend',`<div id="spell_${i}" class="h-20 w-20 border-2 border-light-blue-500 border-opacity-25 relative bg-center bg-contain bg-no-repeat"></div>`);
        if (i < selectedSpellList.length)
        {
            $("#spell_" + i).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("spellsDataBase." + selectedSpellList[i] + ".spritePath") + ")");
            $("#spell_" + i).data("spellDescId", selectedSpellList[i]);
            $("#spell_" + i).click(function() {spellBarClick($(this))});
            tooltipArray.push(new Tooltip(document.getElementById("spell_" + i), PROJECT_ROOT_PATH + eval("spellsDataBase." + selectedSpellList[i] + ".descSpritePath"), "img"));
        }
    }
}

function companionBarDisplay()
{
    document.getElementById("companionBarLayout").insertAdjacentHTML('beforeend',`<div id="companionBar" class="grid grid-cols-4 grid-rows-1 w-max mx-4"></div>`);
    for (i = 0; i < DECK_COMPANIONS; i++)
    {
        document.getElementById("companionBar").insertAdjacentHTML('beforeend',`<div id="companion_${i}" class="h-20 w-20 border-2 border-light-blue-500 border-opacity-25 relative bg-center bg-contain bg-no-repeat"></div>`);
        if (i < selectedCompanionList.length)
        {
            $("#companion_" + i).css("background-image", "url(" + PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("companionsDataBase." + selectedCompanionList[i] + ".entityDescId") + ".spritePath") + ")");
            $("#companion_" + i).data("companionDescId", selectedCompanionList[i]);
            $("#companion_" + i).click(function() {companionBarClick($(this))});
            tooltipArray.push(new Tooltip(document.getElementById("companion_" + i), PROJECT_ROOT_PATH + eval("entitiesDataBase." + eval("companionsDataBase." + selectedCompanionList[i] + ".entityDescId") + ".descSpritePath"), "img"));
        }
    }
}

function validateBtnDisplay()
{
    if (selectedSpellList.length == DECK_SPELLS && selectedCompanionList.length == DECK_COMPANIONS)
    {
        $("#validateBtn").css("background-color", "#00FF00");
        $("#validateBtn").text("Valider");
    }
    else
    {
        $("#validateBtn").css("background-color", "#FF0000");
        $("#validateBtn").text("Deck non rempli");
    }
}

function heroChoiceBtnClick()
{
    choiceDisplayed = "HERO";
    loadPage();
}

function spellChoiceBtnClick()
{
    choiceDisplayed = "SPELL";
    loadPage();
}

function companionChoiceBtnClick()
{
    choiceDisplayed = "COMPANION";
    loadPage();
}

function validateBtnClick()
{
    if (selectedSpellList.length == DECK_SPELLS && selectedCompanionList.length == DECK_COMPANIONS)
    {
        window.location = PROJECT_ROOT_PATH + "index.html?" + selectedHero + "&" + selectedSpellList.join("&") + "&" + selectedCompanionList.join("&");
    }
}

function heroChoiceClick(div)
{
    if ($("#" + div.attr('id')).data("heroDescId"))
    { 
        selectedHero = $("#" + div.attr('id')).data("heroDescId");
        selectedSpellList = []
        for (s in spellsDataBase)
        {
            if (spellsDataBase[s]["race"] == selectedHero)
            {
                selectedSpellList.push(s);
            }
        }
        loadPage();
        $("#" + div.attr('id')).css("background-color", "#6DB3F2");
    }
}

function spellChoiceClick(div)
{
    if ($("#" + div.attr('id')).data("spellDescId") && selectedSpellList.length < DECK_SPELLS && !selectedSpellList.includes($("#" + div.attr('id')).data("spellDescId")))
    {
        selectedSpellList.push($("#" + div.attr('id')).data("spellDescId"));
        loadPage();
        $("#" + div.attr('id')).css("background-color", "#6DB3F2");
    }
}

function companionChoiceClick(div)
{
    if ($("#" + div.attr('id')).data("companionDescId") && selectedCompanionList.length < DECK_COMPANIONS && !selectedCompanionList.includes($("#" + div.attr('id')).data("companionDescId")))
    {
        selectedCompanionList.push($("#" + div.attr('id')).data("companionDescId"));
        loadPage();
        $("#" + div.attr('id')).css("background-color", "#6DB3F2");
    }
}

function spellBarClick(div)
{
    if ($("#" + div.attr('id')).data("spellDescId"))
    {
        index = selectedSpellList.indexOf($("#" + div.attr('id')).data("spellDescId"));
        if (index != 0)
        {
            selectedSpellList.splice(index, 1);
            loadPage();
        }
    }
}

function companionBarClick(div)
{
    if ($("#" + div.attr('id')).data("companionDescId"))
    {
        selectedCompanionList.splice(selectedCompanionList.indexOf($("#" + div.attr('id')).data("companionDescId")), 1);
        loadPage();
    }
}