var stateMap = {}
var countyMap = {}
var groupedOverlays = {}
var currentDate = '2020-06-27'
var maxCasesState = 0;
var maxCasesCounty= 0;
var maxDeathsState = 0;
var maxDeathsCounty = 0;

var maxCounty = null;

var countyInfoMap = {}

var bubbleChartCases = null;
var bubbleData = null;

var dotChartDeaths = null;
var deathPoints = null;


var newYorkCountyFips = "36061";


let deathFactor = 100
let covidDeaths = {
    "name": "COVID-19",
    "capacity": 130000/deathFactor,
    'deaths': 125000,
    "boxes": 125000/deathFactor
  }

let deathData = [

  {
    "name": "9/11",
    "capacity": 130000/deathFactor,
    'deaths': 3000,
    "boxes": 3000/deathFactor
  },
  {
    "name": "Korean War",
    "capacity": 130000/deathFactor,
    "deaths": 36574,
    "boxes": 36574/deathFactor
  },
  {
  	"name": "Vietnam War",
  	"capacity": 130000/deathFactor,
    "deaths": 58200,
  	"boxes": 58200/deathFactor
  },
  {
  	"name": "World War I",
  	"capacity": 130000/deathFactor,
    "deaths": 116500,
  	"boxes": 116500/deathFactor
  },
  covidDeaths
]