var centerPoint = [38.459873-2, -94.711468];
var bounds      = [[centerPoint[0]-3,   centerPoint[1]-1], [centerPoint[0]+3,   centerPoint[1]+1 ]];
var bounds_mask = [[centerPoint[0]-2.6, centerPoint[1]-1], [centerPoint[0]+2.6, centerPoint[1]+1]];
var defaultZoomLevel = 4.0;

var firstTimePlay = true;  


var stateMap = {}
var countyMap = {}
var groupedOverlays = {}
var asOfDate    = "2020-07-10"
var currentDate = "2020-07-10"
var maxCasesState = 0;
var maxCasesCounty= 0;
var maxDeathsState = 0;
var maxDeathsCounty = 0;

var darkMode;
var lightMode;

var maxCounty = null;

var countyInfoMap = {}

var bubbleChartCases = null;
var bubbleData = null;

var countsByState = {}


var dotChartDeaths = null;
var deathPoints = null;


var newYorkCountyFips = "36061";

//var deathColor       = "#9dabd3";
var deathColor = "#dec57b";
var otherDeathColor  = "#c1c7d7";

let deathFactor = 200
let covidDeaths = {
    "name": "COVID-19",
    "capacity": 0,
    'deaths': 0,
    "boxes": 0,
    "color": deathColor
  }

let deathData = [

  {
    "name": "9/11",
    "capacity": 130000/deathFactor,
    'deaths': 3000,
    "boxes": 3000/deathFactor,
    "color": otherDeathColor
  },
  {
    "name": "Korean War",
    "capacity": 130000/deathFactor,
    "deaths": 36574,
    "boxes": 36574/deathFactor,
    "color": otherDeathColor
  },
  {
  	"name": "Vietnam War",
  	"capacity": 130000/deathFactor,
    "deaths": 58200,
  	"boxes": 58200/deathFactor,
    "color": otherDeathColor

  },
  {
  	"name": "World War I",
  	"capacity": 130000/deathFactor,
    "deaths": 116500,
  	"boxes": 116500/deathFactor,
    "color": otherDeathColor

  },
  covidDeaths
]

let stateDeathData = []