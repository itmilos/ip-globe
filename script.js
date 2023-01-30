let sameLocation = false;
let enableRotationPointer;
const width = window.innerWidth;
const height = window.innerHeight - 150;
const config = {
    speed: 0.035,
    verticalTilt: -30,
    horizontalTilt: 3,
};
const md = new MobileDetect(window.navigator.userAgent);

let locations = [
    {
        region: "California",
        latitude: "37.3860",
        longitude: "-122.0838"
    },
];

let separatedLocation;

function separateLoc(location) {
    const [latitude, longitude] = location.loc.split(",");
    return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        region: location.region,
    };
}

fetch("https://ipinfo.io/json")
    .then((response) => response.json())
    .then((data) => {
        separatedLocation = separateLoc(data);
        if (separatedLocation.region === locations[0].region) {
            sameLocation = true;
        } else {
            sameLocation = false;
            locations.push(separatedLocation);
        }
        setup();
    })
    .catch((error) => {
        sameLocation = false;
        console.log(error);
        setup();
    });

const svg = d3.select("svg").attr("width", width).attr("height", height);

const markerGroup = svg.append("g");
const textGroup = svg.append("g");
const projection = d3.geoOrthographic();
const path = d3.geoPath().projection(projection);
const animationLength = 4800;
const animationIconLength = animationLength / 100;

function setup() {
    drawGlobe();
    drawGraticule();
    enableRotation();
    setTimeout(() => {
        disableRotation();
        document.getElementById("contact").classList.remove("hidden");
    }, animationLength);
}

function drawGlobe() {
    d3.queue()
        .defer(
            d3.json,
            "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json"
        )
        .await((error, worldData) => {
            svg
                .selectAll(".segment")
                .data(
                    topojson.feature(worldData, worldData.objects.countries)
                        .features
                )
                .enter()
                .append("path")
                .attr("class", "segment")
                .attr("d", path)
                .attr("width", width)
                .attr("height", height)
                .style(
                    "stroke",
                    () => ["#f0f0f0", "#bdbdbd", "#636363"][(Math.random() * 2) | 0]
                )
                .style("stroke-width", "1px")
                .style(
                    "fill",
                    () => ["#f0f0f0", "#bdbdbd", "#636363"][(Math.random() * 2) | 0]
                )
                .style("opacity", ".6");
        });
}

function drawGraticule() {
    const graticule = d3.geoGraticule();
    svg
        .append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("width", width)
        .attr("height", height)
        .attr("d", path)
        .style("stroke", "rgba(255,255,255,0.2)")
}

function enableRotation() {
    enableRotationPointer = d3.interval((elapsed) => {
        projection
            .scale(md.mobile() === null ? 320 : 550)
            .rotate([
                config.speed * elapsed + 2520,
                config.verticalTilt,
                config.horizontalTilt ,
            ])
            .translate([width / 2, height / 2]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });
}

function disableRotation() {
    d3.select("svg").remove();
    enableRotationPointer.stop();
}

function drawMarkers() {
    function calculateRotationInRem() {
        let result = Math.round(Math.abs(projection.rotate()[0]));
        result += md.mobile() === null ? "30" : "40";
        return result / 50 + "%";
    }

    let locationsData = locations.map((d) => {
        let [x, y] = projection([d.longitude, d.latitude]);
        return {
            x,
            y,
            region: sameLocation ? "We are in the same region" : d.region,
            fontSize: calculateRotationInRem(),
        };
    });

    const markers = markerGroup.selectAll("circle").data(locationsData);
    markers
        .enter()
        .append("circle")
        .merge(markers)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", "#eee")
        .attr("r", 7);

    const text = textGroup.selectAll("text").data(locationsData);
    text
        .enter()
        .append("text")
        .merge(text)
        .attr("font-size", (d) => d.fontSize)
        .attr("fill", "#fff")
        .attr("font-family", "Helvetica Neue")
        .attr("font-weight", "600")
        .attr("x", (d) => d.x + 15)
        .attr("y", (d) => d.y)
        .text((d) => d.region);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });

    textGroup.each(function () {
        this.parentNode.appendChild(this);
    });
    console.log(locations);
}

window.onresize = function () {
    disableRotation();
};

window.onload = function () {
    (cv = document.querySelector("#cvl")), (ctx = cv.getContext("2d"));
    if (!!ctx) {
        (C3 = 1.5 * Math.PI),
            (tc = pct = 0),
            (lnk = document.querySelector('link[rel*="icon"]'));
        ctx.lineWidth = 2;
        ctx.strokeStyle = "fuchsia";
        tc = setInterval(updateLoader, animationIconLength);
    }
};

function updateLoader() {
    with (ctx) {
        clearRect(0, 0, 16, 16);
        beginPath();
        arc(8, 8, 6, C3, (pct * 2 * Math.PI) / 100 + C3);
        stroke();
    }
    lnk.href = cv.toDataURL("image/png");
    if (pct === 100) {
        clearInterval(tc);
        return;
    }
    pct++;
}
