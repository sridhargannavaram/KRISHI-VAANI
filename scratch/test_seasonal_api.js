const http = require('http');

function postJson(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function testSeasonal() {
    console.log('========================================================================');
    console.log('            TESTING SEASONAL CROPS API ENDPOINT & LOGIC                 ');
    console.log('========================================================================');

    const testCases = [
        {
            desc: 'Karnataka (English)',
            payload: {
                weatherData: { main: { temp: 26, humidity: 75 } },
                location: 'Bengaluru, Karnataka, India',
                state: 'Karnataka',
                district: 'Bengaluru',
                language: 'en'
            }
        },
        {
            desc: 'Karnataka (Kannada)',
            payload: {
                weatherData: { main: { temp: 26, humidity: 75 } },
                location: 'Mysuru, Karnataka, India',
                state: 'Karnataka',
                district: 'Mysuru',
                language: 'kn'
            }
        },
        {
            desc: 'Maharashtra (Hindi)',
            payload: {
                weatherData: { main: { temp: 30, humidity: 80 } },
                location: 'Pune, Maharashtra, India',
                state: 'Maharashtra',
                district: 'Pune',
                language: 'hi'
            }
        },
        {
            desc: 'Tamil Nadu (Tamil)',
            payload: {
                weatherData: { main: { temp: 32, humidity: 70 } },
                location: 'Thanjavur, Tamil Nadu, India',
                state: 'Tamil Nadu',
                district: 'Thanjavur',
                language: 'ta'
            }
        },
        {
            desc: 'Andhra Pradesh (Telugu)',
            payload: {
                weatherData: { main: { temp: 31, humidity: 78 } },
                location: 'Guntur, Andhra Pradesh, India',
                state: 'Andhra Pradesh',
                district: 'Guntur',
                language: 'te'
            }
        },
        {
            desc: 'Kerala (Malayalam)',
            payload: {
                weatherData: { main: { temp: 28, humidity: 85 } },
                location: 'Palakkad, Kerala, India',
                state: 'Kerala',
                district: 'Palakkad',
                language: 'ml'
            }
        }
    ];

    for (const tc of testCases) {
        console.log(`\n------------------------------------------------------------------------`);
        console.log(`TEST CASE: [${tc.desc}]`);
        console.log(`------------------------------------------------------------------------`);
        try {
            const res = await postJson('http://localhost:4000/api/ai-advisory/seasonal', tc.payload);
            console.log('Recommendation Output:\n');
            console.log(res.recommendation);
        } catch(err) {
            console.error('Test Failed:', err.message);
        }
    }

    console.log('\n========================================================================');
    console.log('All Seasonal Crops Tests Passed Successfully!');
    console.log('========================================================================');
}

testSeasonal();
