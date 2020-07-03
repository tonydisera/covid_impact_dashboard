var stateMap = {}
var countyMap = {}
var groupedOverlays = {}
var asOfDate    = "2020-06-29"
var currentDate = "2020-06-29"
var maxCasesState = 0;
var maxCasesCounty= 0;
var maxDeathsState = 0;
var maxDeathsCounty = 0;

var maxCounty = null;

var countyInfoMap = {}

var bubbleChartCases = null;
var bubbleData = null;

var countsByState = {}


var dotChartDeaths = null;
var deathPoints = null;


var newYorkCountyFips = "36061";


let deathFactor = 100
let covidDeaths = {
    "name": "COVID-19",
    "capacity": 0,
    'deaths': 0,
    "boxes": 0,
    "color": "#FF4941"
  }

let deathData = [

  {
    "name": "9/11",
    "capacity": 130000/deathFactor,
    'deaths': 3000,
    "boxes": 3000/deathFactor,
    "color": "#FF8E79"
  },
  {
    "name": "Korean War",
    "capacity": 130000/deathFactor,
    "deaths": 36574,
    "boxes": 36574/deathFactor,
    "color": "#FF8E79"
  },
  {
  	"name": "Vietnam War",
  	"capacity": 130000/deathFactor,
    "deaths": 58200,
  	"boxes": 58200/deathFactor,
    "color": "#FF8E79"

  },
  {
  	"name": "World War I",
  	"capacity": 130000/deathFactor,
    "deaths": 116500,
  	"boxes": 116500/deathFactor,
    "color": "#FF8E79"

  },
  covidDeaths
]

let stateDeathData = []