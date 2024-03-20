const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const axios = require('axios').default;

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { request } = require('http');
// const { json } = require('node:stream/consumers');

// @route GET api/data/clouds
// @desc Test Route
// @access Public
router.get('/:lat/:lon', async (req,res) => {
    const APIkey = "1fbc48e0d5e9ef7e144de332f8648651"
    const lat = req.params.lat
    const lon = req.params.lon
    // "57.0539""2.4910"
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}`);
        // console.log(weather.data.list[0].clouds.all)
        // console.log(weather.data.list[0].dt_txt.split(' ')[1])

        var times = []
        var dateFinal = []
        for(i=0; i<weather.data.list.length; i++) {
            var currentData = parseInt(weather.data.list[i].dt_txt.split(' ')[1].replace(/'/g,""))
            var currentDate = String(weather.data.list[i].dt_txt.split(' ')[0])//.split('-')[2]+[1])
            times.push(currentData)
            dateFinal.push(currentDate)
            console.log(currentDate)
        }
        console.log("DateFinal")
        console.log(dateFinal)
        // Get kp index data
        const kpIndex = await axios.get(`https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`);
        var jsonKpIndex = kpIndex.data.split('\n').map(function (el) { return el.split(/\s+/); });
        console.log(jsonKpIndex)
        // Get Sunrise/Sunset Data
        const sunData = await axios.get(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=today&formatted=0`)

        // Initilase arrays
        var allData = []
        var kp = []
        var dates = []

        // Creates the full array of data
        for(i=16; i<jsonKpIndex.length-1;i++){
            allData.push(jsonKpIndex[i])
        }

        // Add dates
        dates.push(allData[0][2]+" "+allData[0][1])
        dates.push(allData[0][4]+" "+allData[0][3])
        dates.push(allData[0][6]+" "+allData[0][5])
        console.log(dates)



        // Concatinates the arrays
        kp = kp.concat(allData[1],allData[2],allData[3],allData[4],allData[5],allData[6],allData[7],allData[8])

        // Splits into columns
        done = [...Array(4).keys()].map(c => kp.filter((_, i) => i % 4 === c));

        var i = 0
        while(times[i] != 0){
            i += 1
        }
        // console.log(i)
        const shortened = done[1].slice(done[1].length-i, done[1].length)
        // console.log(done[1])

        var final = []
        final = final.concat(shortened, done[2], done[3])

        console.log("this")
        console.log(final)
        // Final data arrya
        finalData = []

        datesFinal = []

        for(i=0;i<times.length;i++){
            datesFinal.push(dates)
        }
        console.log(datesFinal)
        // Data dictionary
        for(i=0;i<final.length;i++){
            const dict = {
                date: dateFinal[i],
                time: times[i],
                kpIndex: final[i],
                cloudCoverage: weather.data.list[i].clouds.all,
                sunrise: sunData.data.results.nautical_twilight_begin.substring(11,16),
                sunset: sunData.data.results.nautical_twilight_end.substring(11,16)
            }
            finalData.push(dict)
        }

        
        // console.log(done)
        console.log(finalData[0])
        // console.log(finalData.length)
        res.send(finalData)
        // console.log(sunData)
        // console.log(sunData.data.results.nautical_twilight_begin)
    
    
    } catch (error) {
        console.error(error);
        res.status(400).send("Server Error")
    }
    
    console.log("Complete")

    
})

module.exports = router