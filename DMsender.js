function onEdit(e) {
  // 편집된 시트의 정보 가져오기
  if (e) {
    var sheet = e.source.getSheetByName("sheet"); // 시트 이름을 적절히 변경
    var range = e.range;

    // 이메일이 입력된 열의 정보 가져오기 (예: 이메일이 있는 열이 2번째 열일 경우)
    var emailColumn = 2; // 이메일이 있는 열의 번호를 적절히 변경
    var email = sheet.getRange(range.getRow(), emailColumn).getValue();

    // Slack API를 사용하여 Slack ID 찾기
    var slackId = getSlackIdByEmail(email);

    if (slackId) {
      // Slack으로 보낼 메시지 생성
      var message = "슬랙 DM 메시지 내용";

      // Slack으로 DM 보내기
      sendSlackDM(slackId, message);
    } else {
      Logger.log("Slack ID를 찾을 수 없습니다.");
    }
  } else {
    Logger.log("이벤트 정보가 없습니다.");
  }
}

// Slack API를 사용하여 이메일로 Slack ID를 찾는 함수
function getSlackIdByEmail(email) {
  // Slack API 호출을 위한 Slack App의 OAuth Access Token
  var slackAccessToken =
    PropertiesService.getScriptProperties().getProperty("slackAccessToken");

  // Slack API 호출 URL
  var apiUrl = "https://slack.com/api/users.lookupByEmail";

  // Slack API 호출 옵션 설정
  var options = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    headers: {
      Authorization: "Bearer " + slackAccessToken,
    },
    payload: "email=" + encodeURIComponent(email),
    muteHttpExceptions: true,
  };

  // Slack API 호출 및 응답 처리
  var response = UrlFetchApp.fetch(apiUrl, options);
  var responseData = JSON.parse(response.getContentText());

  // Slack API 응답에서 Slack ID 추출
  if (responseData.ok) {
    return responseData.user.id;
  } else {
    Logger.log("Slack API 오류: " + responseData.error);
    return null;
  }
}

// Slack으로 DM을 보내는 함수
function sendSlackDM(slackId, message) {
  // Slack API 호출을 위한 Slack App의 OAuth Access Token
  var slackAccessToken =
    PropertiesService.getScriptProperties().getProperty("slackAccessToken");

  // Slack API 호출 URL
  var apiUrl = "https://slack.com/api/chat.postMessage";

  // Slack API 호출 옵션 설정
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + slackAccessToken,
    },
    payload: JSON.stringify({
      channel: slackId, // Slack ID를 사용하여 DM을 보낼 대상 지정
      text: message,
    }),
    muteHttpExceptions: true,
  };

  // Slack API 호출 및 응답 처리
  var response = UrlFetchApp.fetch(apiUrl, options);
  var responseData = JSON.parse(response.getContentText());

  // Slack API 응답 확인
  if (responseData.ok) {
    Logger.log("Slack DM이 성공적으로 전송되었습니다.");
  } else {
    Logger.log("Slack API 오류: " + responseData.error);
  }
}
