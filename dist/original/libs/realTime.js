(function () {
    window.SPN_REQUESTLY = window.SPN_REQUESTLY || {};
    window.SPN_REQUESTLY.responseRules =
        window.SPN_REQUESTLY.responseRules || {};
    window.SPN_REQUESTLY.responseRulesPattern =
        window.SPN_REQUESTLY.responseRulesPattern || [];
    console.info("Rule Loaded");
    var MATCH_TYPE = {
        EXACT: "EXACT",
        PATTERN: "PATTERN",
    };

    var EXECUTE_TYPE = {
        CODE: "code",
        VALUE: "value",
    };

    var newResponse = {};
    /**
     * No need to change anything above this line
     */

    var name = "api_base_update";
    var url = "";

    var matchType = MATCH_TYPE.PATTERN;
    var executeType = EXECUTE_TYPE.CODE;
    var responseModify = true;
    var requestModify = true;
    var bodyModify = true;

    newResponse = {
        status: 200,
        statusText: "OK",
        name: "",
    };

    function __shouldModify() {
        var routeMatch = ["apiv2.sonyliv.com"];
        var endpointMatch = ["VIDEOURL"];
        var keywordMatch = [""];
        return {
            routeMatch: routeMatch,
            endpointMatch: endpointMatch,
            keywordMatch: keywordMatch,
        };
    }

    var __requestModifyFunction = function __requestModifyFunctionPrivate(url) {
        url = url.replace("/WEB/", "/IOS/");
        return url;
    };
    var __bodyModifyFunction = function __bodyModifyFunctionPrivate(
        requestObject
    ) {
        //console.error("naveen ", requestObject);
        requestObject.browser = "safari";
        return requestObject;
    };
    var __responseModifyFunction = function __responseModifyFunctionPrivate(
        response
    ) {
        if (response && response.resultObj && response.resultObj.targetedDelivery.td_server_hints) {
            response.resultObj.targetedDelivery.td_server_hints.analytics_expt_id = "Sonyliv_temp";
        }
        return response;
    };

    /*
     * No need to modify the below code
     */

    function shouldModify(url) {
        var matchObj = __shouldModify();
        if (!url || url.length === 0 || typeof url !== "string") {
            return false;
        }
        var routeMatch = matchObj.routeMatch;
        var endpointMatch = matchObj.endpointMatch;
        var keywordMatch = matchObj.keywordMatch;

        var result = true;

        for (var i = 0; i < routeMatch.length; i++) {
            if (url.indexOf(routeMatch[i]) === -1) {
                result = false;
                break;
            }
        }
        if (!result) {
            return result;
        }
        for (var i = 0; i < endpointMatch.length; i++) {
            if (url.indexOf(endpointMatch[i]) === -1) {
                result = false;
                break;
            }
        }
        if (!result) {
            return result;
        }
        for (var i = 0; i < keywordMatch.length; i++) {
            if (url.indexOf(keywordMatch[i]) === -1) {
                result = false;
                break;
            }
        }

        if (result) {
            //console.info("Matched with url :: ", url);
        }
        return result;
    }

    function replaceResponse() {
        responseText = JSON.stringify(newResponse);
        return responseText;
    }

    function requestModifyFunction(url) {
        return __requestModifyFunction(url);
    }

    function bodyModifyFunction(requestObj) {
        return __bodyModifyFunction(requestObj);
    }

    function responseModifyFunction(requestObj) {
        var responseJSON = requestObj.responseJSON;
        var modifyJson = __responseModifyFunction(responseJSON);
        var modifyJsonString = JSON.stringify(modifyJson);
        return modifyJsonString;
    }

    var returnObj = {
        id: name,
        matchType: matchType,
        requestModify: requestModify,
        responseModify: responseModify,
        bodyModify: bodyModify,
        executeType: executeType,
        value: replaceResponse(),
        requestModifyFunction: requestModifyFunction,
        responseModifyFunction: responseModifyFunction,
        bodyModifyFunction: bodyModifyFunction,
        shouldModify: shouldModify,
    };
    if (matchType === MATCH_TYPE.EXACT) {
        window.SPN_REQUESTLY.responseRules[url] = returnObj;
    } else if (matchType === MATCH_TYPE.PATTERN) {
        window.SPN_REQUESTLY.responseRulesPattern.push(returnObj);
    }
})();
