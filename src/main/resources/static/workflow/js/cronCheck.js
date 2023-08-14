function cronCheck(){
    let cron = document.querySelector('.cron_inp input').value
    let crons = cron.split(" ")

    if(crons.length !== 6 && crons.length !== 7){
        console.log(crons.length )
        return false
    }

    //초 seconds
    if(crons[0] === '*'){
        console.log("초 : 초는 * 불가")
        return false
    }

    // 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false
    if(/^[0-9]|,|-|\*|\/$/.test(crons[0]) === false){
        console.log("초 : 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false")
        return false
    }

    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[0])){
        // 숫자만 있을 시 0보다 작거나 59보다 크면 false
        if(parseInt(crons[0]) < 0 || parseInt(crons[0]) > 59){
            console.log("초 : 숫자만 있을 시 0보다 작거나 59보다 크면 false")
            return false
        }
    }


    if(crons[0].includes("/")) {
        // '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false
        if (crons[0].split("/").length !== 2) {       // '/' 있으면 2개가 있는지 확인
            console.log("초 : '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false")
            return false
        } else {
            // '/' 기준 앞에 0 or * 확인
            if (/^0|\*$/.test(crons[0].split("/")[0]) === false) {
                console.log("초 : '/' 기준 앞에 0 or * 확인")
                return false
            }
            // '/' 기준 뒤에 숫자 외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[0].split("/")[1]) === false) {
                console.log("초 : '/' 기준 뒤에 숫자 외의 값이 있으면 false")
                return false
            }
            // 0보다 작거나 59보다 크면 false
            if (parseInt(crons[0].split("/")[1]) < 0 || parseInt(crons[0].split("/")[1]) > 59) {
                console.log("초 : 0보다 작거나 59보다 크면 false")
                return false
            }
        }
    }

    if(crons[0].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 60보다 크면 false
        if (crons[0].split(",").length > 60) {
            console.log("초 : ',' 문자가 들어가면서 배열 길이가 60보다 크면 false")
            return false
        } else {
            let arr = crons[0].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 자른 문자가 숫자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false) {
                    console.log("초 : 자른 문자가 숫자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 0 || parseInt(arr[i]) > 59) {
                    console.log("초 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[0].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[0].split("-").length !== 2) {
            console.log("초 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[0].split("-")[0]) === false) {
                console.log("초 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[0].split("-")[1]) === false) {
                console.log("초 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false
            if (parseInt(crons[0].split("-")[1]) < 0 || parseInt(crons[0].split("-")[1]) > 59) {
                console.log("초 : '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false")
                return false
            }

            // '-' 기준 앞의 값이 뒤의 값보다 크면 false
            if (parseInt(crons[0].split("-")[0]) > parseInt(crons[0].split("-")[1])) {
                console.log("초 : '-' 기준 앞의 값이 뒤의 값보다 크면 false")
                return false
            }
        }
    }

    // 분 minutes
    // 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false
    if(/^[0-9]|,|-|\*|\/$/.test(crons[1]) === false){
        console.log("분 : 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false")
        return false
    }

    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[1])){
        // 숫자만 있을 시 0보다 작거나 59보다 크면 false
        if(parseInt(crons[1]) < 0 || parseInt(crons[1]) > 59){
            console.log("분 : 숫자만 있을 시 0보다 작거나 59보다 크면 false")
            return false
        }
    }

    if(crons[1].includes("/")) {
        // '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false
        if (crons[1].split("/").length !== 2) {       // '/' 있으면 2개가 있는지 확인
            console.log("분 : '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false")
            return false
        } else {
            // '/' 기준 앞에 0 or * 확인
            if (/^0|\*$/.test(crons[1].split("/")[0]) === false) {
                console.log("분 : '/' 기준 앞에 0 or * 확인")
                return false
            }
            // '/' 기준 뒤에 숫자 외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[1].split("/")[1]) === false) {
                console.log("분 : '/' 기준 뒤에 숫자 외의 값이 있으면 false")
                return false
            }
            // 0보다 작거나 59보다 크면 false
            if (parseInt(crons[1].split("/")[1]) < 0 || parseInt(crons[1].split("/")[1]) > 59) {
                console.log("분 : 0보다 작거나 59보다 크면 false")
                return false
            }
        }
    }

    if(crons[1].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 60보다 크면 false
        if (crons[1].split(",").length > 60) {
            console.log("분 : ',' 문자가 들어가면서 배열 길이가 60보다 크면 false")
            return false
        } else {
            let arr = crons[1].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 자른 문자가 숫자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false) {
                    console.log("분 : 자른 문자가 숫자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 0 || parseInt(arr[i]) > 59) {
                    console.log("분 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[1].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[1].split("-").length !== 2) {
            console.log("분 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[1].split("-")[0]) === false) {
                console.log("분 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[1].split("-")[1]) === false) {
                console.log("분 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false
            if (parseInt(crons[1].split("-")[1]) < 0 || parseInt(crons[1].split("-")[1]) > 59) {
                console.log("분 : '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false")
                return false
            }

            // '-' 기준 앞의 값이 뒤의 값보다 크면 false
            if (parseInt(crons[1].split("-")[0]) > parseInt(crons[1].split("-")[1])) {
                console.log("분 : '-' 기준 앞의 값이 뒤의 값보다 크면 false")
                return false
            }
        }
    }

    // 시 hours
    // 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false
    if(/^[0-9]|,|-|\*|\/$/.test(crons[2]) === false){
        console.log("시 : 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false")
        return false
    }

    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[2])){
        // 숫자만 있을 시 0보다 작거나 59보다 크면 false
        if(parseInt(crons[2]) < 0 || parseInt(crons[2]) > 23){
            console.log("시 : 숫자만 있을 시 0보다 작거나 59보다 크면 false")
            return false
        }
    }

    if(crons[2].includes("/")) {
        // '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false
        if (crons[2].split("/").length !== 2) {       // '/' 있으면 2개가 있는지 확인
            console.log("시 : '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false")
            return false
        } else {
            // '/' 기준 앞에 0 or * 확인
            if (/^0|\*$/.test(crons[2].split("/")[0]) === false) {
                console.log("시 : '/' 기준 앞에 0 or * 확인")
                return false
            }
            // '/' 기준 뒤에 숫자 외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[2].split("/")[1]) === false) {
                console.log("시 : '/' 기준 뒤에 숫자 외의 값이 있으면 false")
                return false
            }
            // 0보다 작거나 59보다 크면 false
            if (parseInt(crons[2].split("/")[1]) < 0 || parseInt(crons[2].split("/")[1]) > 23) {
                console.log("시 : 0보다 작거나 59보다 크면 false")
                return false
            }
        }
    }

    if(crons[2].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 60보다 크면 false
        if (crons[2].split(",").length > 23) {
            console.log("시 : ',' 문자가 들어가면서 배열 길이가 60보다 크면 false")
            return false
        } else {
            let arr = crons[2].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 자른 문자가 숫자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false) {
                    console.log("시 : 자른 문자가 숫자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 0 || parseInt(arr[i]) > 23) {
                    console.log("시 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[2].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[2].split("-").length !== 2) {
            console.log("시 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[2].split("-")[0]) === false) {
                console.log("시 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[2].split("-")[1]) === false) {
                console.log("시 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false
            if (parseInt(crons[2].split("-")[1]) < 0 || parseInt(crons[2].split("-")[1]) > 23) {
                console.log("시 : '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false")
                return false
            }

            // '-' 기준 앞의 값이 뒤의 값보다 크면 false
            if (parseInt(crons[2].split("-")[0]) > parseInt(crons[2].split("-")[1])) {
                console.log("시 : '-' 기준 앞의 값이 뒤의 값보다 크면 false")
                return false
            }
        }
    }

    // 일 day of month
    // 숫자 , ',' , '-' , '/' , '*' , '?'외 다른 문자가 있으면 false
    if(/^[0-9]|,|-|\*|\/|\?$/.test(crons[3]) === false){
        console.log("일 : 숫자 , ',' , '-' , '/' , '*' , '?'외 다른 문자가 있으면 false")
        return false
    }

    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[3])){
        // 숫자만 있을 시 1보다 작거나 59보다 크면 false
        if(parseInt(crons[3]) < 1 || parseInt(crons[3]) > 31){
            console.log("일 : 숫자만 있을 시 1보다 작거나 59보다 크면 false")
            return false
        }
    }

    if(crons[3].includes("/")) {
        // '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false
        if (crons[3].split("/").length !== 2) {
            console.log("일 : '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false")
            return false
        } else {
            // '/' 기준 앞에 0 or * 확인
            if (/^0|\*$/.test(crons[3].split("/")[0]) === false) {
                console.log("일 : '/' 기준 앞에 0 or * 확인")
                return false
            }
            // '/' 기준 뒤에 숫자 외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[3].split("/")[1]) === false) {
                console.log("일 : '/' 기준 뒤에 숫자 외의 값이 있으면 false")
                return false
            }
            // 0보다 작거나 59보다 크면 false
            if (parseInt(crons[3].split("/")[1]) < 1 || parseInt(crons[3].split("/")[1]) > 31) {
                console.log("일 : 0보다 작거나 59보다 크면 false")
                return false
            }
        }
    }

    if(crons[3].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 30보다 크면 false
        if (crons[3].split(",").length > 30) {
            console.log("일 : ',' 문자가 들어가면서 배열 길이가 30보다 크면 false")
            return false
        } else {
            let arr = crons[3].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 자른 문자가 숫자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false) {
                    console.log("일 : 자른 문자가 숫자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 1 || parseInt(arr[i]) > 31) {
                    console.log("일 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[3].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[3].split("-").length !== 2) {
            console.log("일 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[3].split("-")[0]) === false) {
                console.log("일 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[3].split("-")[1]) === false) {
                console.log("일 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false
            if (parseInt(crons[3].split("-")[1]) < 1 || parseInt(crons[3].split("-")[1]) > 31) {
                console.log("일 : '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false")
                return false
            }

            // '-' 기준 앞의 값이 뒤의 값보다 크면 false
            if (parseInt(crons[3].split("-")[0]) > parseInt(crons[3].split("-")[1])) {
                console.log("일 : '-' 기준 앞의 값이 뒤의 값보다 크면 false")
                return false
            }
        }
    }

    //월 month
    // 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false
    if(/^[0-9]|,|-|\*|\/$/.test(crons[4]) === false){
        console.log("월 : 숫자 , ',' , '-' , '/' , '*' 외 다른 문자가 있으면 false")
        return false
    }


    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[4])){
        // 숫자만 있을 시 1보다 작거나 12보다 크면 false
        if(parseInt(crons[4]) < 1 || parseInt(crons[4]) > 12){
            console.log("월 : 숫자만 있을 시 1보다 작거나 12보다 크면 false")
            return false
        }
    }

    if(crons[4].includes("/")) {
        // '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false
        if (crons[4].split("/").length !== 2) {
            console.log("월 : '/' 문자가 있으면서 배열 크기가 2개가 아닌 값 모두 false")
            return false
        } else {
            // '/' 기준 앞에 0 or * 확인
            if (/^0|\*$/.test(crons[4].split("/")[0]) === false) {
                console.log("월 : '/' 기준 앞에 0 or * 확인")
                return false
            }
            // '/' 기준 뒤에 숫자 외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[4].split("/")[1]) === false) {
                console.log("월 : '/' 기준 뒤에 숫자 외의 값이 있으면 false")
                return false
            }
            // 0보다 작거나 59보다 크면 false
            if (parseInt(crons[4].split("/")[1]) < 1 || parseInt(crons[4].split("/")[1]) > 12) {
                console.log("월 : 0보다 작거나 59보다 크면 false")
                return false
            }
        }
    }

    if(crons[4].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 11보다 크면 false
        if (crons[4].split(",").length > 11) {
            console.log("월 : ',' 문자가 들어가면서 배열 길이가 11보다 크면 false")
            return false
        } else {
            let arr = crons[4].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 자른 문자가 숫자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false) {
                    console.log("월 : 자른 문자가 숫자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 1 || parseInt(arr[i]) > 12) {
                    console.log("월 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[4].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[4].split("-").length !== 2) {
            console.log("월 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[4].split("-")[0]) === false) {
                console.log("월 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[4].split("-")[1]) === false) {
                console.log("월 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false
            if (parseInt(crons[4].split("-")[1]) < 1 || parseInt(crons[4].split("-")[1]) > 12) {
                console.log("월 : '-' 기준 뒤에 값이 0보다 작거나 59보다 크면 false")
                return false
            }

            // '-' 기준 앞의 값이 뒤의 값보다 크면 false
            if (parseInt(crons[4].split("-")[0]) > parseInt(crons[4].split("-")[1])) {
                console.log("월 : '-' 기준 앞의 값이 뒤의 값보다 크면 false")
                return false
            }
        }
    }

    //요일 day of week
    let month = ['SUN','MON','TUE','WED','THU','FRI','SAT']

    // 값이 문자 형식(month변수 체크)으로 하지 않았다면
    // 소문자를 대문자로 변경 toUpperCase()
    if(month.includes(crons[5].toUpperCase()) === false){
        // 숫자 , ',' , '-' , '*' , '?'외 다른 문자가 있으면 false
        if(/^[0-9]|,|-|\*|\?$/.test(crons[5]) === false){
            console.log("요일 : 숫자 , ',' , '-' , '*' , '?'외 다른 문자가 있으면 false")
            return false
        }
    }

    // 숫자만 있는지 확인
    if(/^[0-9]+$/.test(crons[5])){
        // 숫자만 있을 시 1보다 작거나 7보다 크면 false
        if(parseInt(crons[5]) < 1 || parseInt(crons[5]) > 7){
            console.log("요일 : 숫자만 있을 시 1보다 작거나 7보다 크면 false")
            return false
        }
    }

    if(crons[5].includes(",")) {
        // ',' 문자가 들어가면서 배열 길이가 6보다 크면 false
        if (crons[5].split(",").length > 6) {
            console.log("요일 : ',' 문자가 들어가면서 배열 길이가 6보다 크면 false")
            return false
        } else {
            let arr = crons[5].split(",");
            // ',' 기준으로 자른 문자 반복
            for (let i = 0; i < arr.length; i++) {
                // 요일 : 자른 문자가 숫자 또는 지정된 문자 이외값이 있으면 false
                if (/^[0-9]+$/.test(arr[i]) === false && !month.includes(arr[i])) {
                    console.log("요일 : 자른 문자가 숫자 또는 지정된 문자 이외값이 있으면 false")
                    return false
                }
                // 자른 문자가 0보다 작거나 59보다 크면 false
                if (parseInt(arr[i]) < 1 || parseInt(arr[i]) > 7) {
                    console.log("요일 : 자른 문자가 0보다 작거나 59보다 크면 false")
                    return false
                }
            }
        }
    }

    if(crons[5].includes("-")) {
        // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
        if (crons[5].split("-").length !== 2) {
            console.log("요일 : 자른 문자가 0보다 작거나 59보다 크면 false")
            return false
        } else {
            // '-' 기준 앞에 값이 숫자 또는 특정문자 이외의 값이면 false
            if (/^[0-9]+$/.test(crons[5].split("-")[0]) === false && month.includes(crons[5].split("-")[0].toUpperCase()) === false) {
                console.log("요일 : '-' 기준 앞에 값이 숫자 또는 특정문자 이외의 값이면 false")
                return false
            }

            // '-' 기준 뒤에 값이 숫자 또는 특정문자 이외의 값이 있으면 false
            if (/^[0-9]+$/.test(crons[5].split("-")[1]) === false && month.includes(crons[5].split("-")[1].toUpperCase()) === false) {
                console.log("요일 : '-' 기준 뒤에 값이 숫자 또는 특정문자 이외의 값이 있으면 false")
                return false
            }

            // '-' 기준 앞에 값이 숫자이고 1보다 작거나 7보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[0]) === true) {
                if (parseInt(crons[5].split("-")[1]) < 1 || parseInt(crons[5].split("-")[1]) > 7) {
                    console.log("요일 : '-' 기준 앞에 값이 숫자이고 1보다 작거나 7보다 크면 false")
                    return false
                }
            }
            
            // '-' 기준 뒤에 값이 숫자이고 1보다 작거나 7보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[1]) === true) {
                if (parseInt(crons[5].split("-")[1]) < 1 || parseInt(crons[5].split("-")[1]) > 7) {
                    console.log("요일 : '-' 기준 뒤에 값이 숫자이고 1보다 작거나 7보다 크면 false")
                    return false
                }
            }


            // '-' 기준 앞의 값이 숫자이고 뒤에 숫자 값보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[0]) && /^[0-9]+$/.test(crons[5].split("-")[1])) {
                if (parseInt(crons[5].split("-")[0]) > parseInt(crons[5].split("-")[1])) {
                    console.log("요일 : '-' 기준 앞의 값이 숫자이고 뒤에 숫자 값보다 크면 false")
                    return false
                }
            }

            // '-' 기준 앞의 값이 숫자이고 뒤에 문자 값보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[0]) && /^[0-9]+$/.test(crons[5].split("-")[1])===false) {
                if (parseInt(crons[5].split("-")[0]) > month.indexOf(crons[5].split("-")[1].toUpperCase()) + 1) {
                    console.log("요일 : '-' 기준 앞의 값이 숫자이고 뒤에 문자 값보다 크면 false")
                    return false
                }
            }

            // '-' 기준 앞의 값이 문자이고 뒤에 숫자 값보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[0])===false && /^[0-9]+$/.test(crons[5].split("-")[1])) {
                if (month.indexOf(crons[5].split("-")[0].toUpperCase()) + 1 > parseInt(crons[5].split("-")[1])) {
                    console.log("요일 : '-' 기준 앞의 값이 문자이고 뒤에 숫자 값보다 크면 false")
                    return false
                }
            }

            // '-' 기준 앞의 값이 문자이고 뒤에 문자 값보다 크면 false
            if(/^[0-9]+$/.test(crons[5].split("-")[0])===false && /^[0-9]+$/.test(crons[5].split("-")[1])===false) {
                if (month.indexOf(crons[5].split("-")[0].toUpperCase()) + 1 > month.indexOf(crons[5].split("-")[1].toUpperCase()) + 1) {
                    console.log("요일 : '-' 기준 앞의 값이 문자이고 뒤에 문자 값보다 크면 false")
                    return false
                }
            }
        }
    }

    //년 year
    if(crons.length===7){
        // 숫자 ',' , '-' , '*' , '/'
        if(/^[0-9]|,|-|\*$/.test(crons[5]) === false){
            console.log("년 : 숫자 ',' , '-' , '*' , '/'")
            return false
        }

        // 숫자만 있는지 확인
        if(/^[0-9]+$/.test(crons[6])){
            // 숫자만 있을 시 1970보다 작거나 2099보다 크면 false
            if(parseInt(crons[6]) < 1970 || parseInt(crons[6]) > 2099){
                console.log("년 : 숫자만 있을 시 1970보다 작거나 2099보다 크면 false")
                return false
            }
        }



        if(crons[6].includes(",")) {
            // ',' 문자가 들어가면서 배열 길이가 129보다 크면 false
            if (crons[6].split(",").length > 129) {
                console.log("년 : ',' 문자가 들어가면서 배열 길이가 129보다 크면 false")
                return false
            } else {
                let arr = crons[6].split(",");
                // ',' 기준으로 자른 문자 반복
                for (let i = 0; i < arr.length; i++) {
                    // 자른 문자가 숫자 이외값이 있으면 false
                    if (/^[0-9]+$/.test(arr[i]) === false) {
                        console.log("년 : 자른 문자가 숫자 이외값이 있으면 false")
                        return false
                    }
                    // 자른 문자가 1970보다 작거나 2099보다 크면 false
                    if (parseInt(arr[i]) < 1970 || parseInt(arr[i]) > 2099) {
                        console.log("년 : 자른 문자가 0보다 작거나 59보다 크면 false")
                        return false
                    }
                }
            }
        }

        if(crons[6].includes("-")) {
            // '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false
            if (crons[6].split("-").length !== 2) {
                console.log("년 : '-' 문자 기준으로 잘랐을 때 배열 크기가 2개가 아니면 false")
                return false
            } else {
                // '-' 기준 앞에 값이 숫자 이외의 값이면 false
                if (/^[0-9]+$/.test(crons[6].split("-")[0]) === false) {
                    console.log("년 : '-' 기준 앞에 값이 숫자 이외의 값이면 false")
                    return false
                }

                // '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false
                if (/^[0-9]+$/.test(crons[6].split("-")[1]) === false) {
                    console.log("년 : '-' 기준 뒤에 값이 숫자 이외의 값이 있으면 false")
                    return false
                }

                // '-' 기준 뒤에 앞이 1970보다 작거나 2099보다 크면 false
                if (parseInt(crons[6].split("-")[0]) < 1970 || parseInt(crons[6].split("-")[0]) > 2099) {
                    console.log("년 : '-' 기준 뒤에 앞이 1970보다 작거나 2099보다 크면 false")
                    return false
                }

                // '-' 기준 뒤에 값이 1970보다 작거나 2099보다 크면 false
                if (parseInt(crons[6].split("-")[1]) < 1970 || parseInt(crons[6].split("-")[1]) > 2099) {
                    console.log("년 : '-' 기준 뒤에 값이 1970보다 작거나 2099보다 크면 false")
                    return false
                }

                // '-' 앞의 값이 뒤에 값보다 크면 false
                if (parseInt(crons[6].split("-")[0]) > parseInt(crons[6].split("-")[1])) {
                    console.log("년 : '-' 앞의 값이 뒤에 값보다 크면 false")
                    return false
                }

            }
        }
    }
    

    return true
}