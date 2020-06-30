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

var bubbleData = null;


var newYorkCountyFips = "36061";


let deathFactor = 300

let deathData = [

  {
    "name": "9/11",
    "capacity": 130000/deathFactor,
    "boxes": 3000/deathFactor
  },
  {
    "name": "Korean War",
    "capacity": 130000/deathFactor,
    "boxes": 36574/deathFactor
  },
  {
  	"name": "Vietnam War",
  	"capacity": 130000/deathFactor,
  	"boxes": 58200/deathFactor
  },
  {
  	"name": "World War I",
  	"capacity": 130000/deathFactor,
  	"boxes": 116500/deathFactor
  },
  {
    "name": "COVID-19",
    "capacity": 13000/deathFactor,
    "boxes": 125000/deathFactor
  }
]