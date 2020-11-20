
function isMobileOrTablet() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


var map = null;
var timeslider = null;

var centerPoint = [38.459873-4, -94.711468-1];
var bounds      = [[centerPoint[0]-3,   centerPoint[1]-1], [centerPoint[0]+3,   centerPoint[1]+1 ]];
var bounds_mask = [[centerPoint[0]-2.6, centerPoint[1]-1], [centerPoint[0]+2.6, centerPoint[1]+1]];
var defaultZoomLevel = isMobileOrTablet() ? 3.65 : 4.2;

var firstTimePlay = true;  


var stateMap = {}
var countyMap = {}
var groupedOverlays = {}
var maxDate     = "";
var currentDate = ""
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

var casesByMonth = [];


var newYorkCountyFips = "36061";

//var deathColor       = "#9dabd3";
var deathColor = "#eb5f48";
var otherDeathColor  = "#c1c7d7";

let deathFactor = 300
let covidDeaths = {
    "name": "COVID-19",
    "capacity": 0,
    'deaths': 0,
    "boxes": 0,
    "color": deathColor
  }
let capacity = 130000

let deathData = [
/*
  {
    "name": "9/11",
    "capacity": 130000/deathFactor,
    'deaths': 3000,
    "boxes": 3000/deathFactor,
    "color": otherDeathColor
  },
  */
  {
    "name": "Korean War",
    "capacity": capacity/deathFactor,
    "deaths": 36574,
    "boxes": 36574/deathFactor,
    "color": otherDeathColor
  },
  {
  	"name": "Vietnam War",
  	"capacity": capacity/deathFactor,
    "deaths": 58200,
  	"boxes": 58200/deathFactor,
    "color": otherDeathColor

  },
  {
  	"name": "World War I",
  	"capacity": capacity/deathFactor,
    "deaths": 116500,
  	"boxes": 116500/deathFactor,
    "color": otherDeathColor

  },
  {
    "name": "World War II",
    "capacity": capacity/deathFactor,
    "deaths": 405399,
    "boxes": 405399/deathFactor,
    "color": otherDeathColor

  },
  covidDeaths
]

let WAFFLE_CELL_SIZE = 5;
let WAFFLE_CELLS_PER_ROW = 12;
let stateDeathData = []