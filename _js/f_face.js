// Global variables needed to work with face.com API
var api_key = '0a177b4e57080f4617080a51c64433a2';
var api_secret = 'b430351b87de49047d12192442d125db';
var namespace = 'dynamit76';

function recognizeFace(path){		

	
	var url = path;
	var uid = 'all';
	var detector = 'Aggressive';
	var attributes = 'all';
			
	$.ajax('http://api.face.com/faces/recognize.json',{
		data: {
			'api_key' : api_key,
			'api_secret' : api_secret,
			'urls' : url,
			'uids' : uid,
			'namespace' : namespace,
			'detector' : detector,
			'attributes' : attributes
			},
		cache: false,
		dataType: 'json',
		timeout: 10000,
		success: detectSuccess,
		error: detectError
	}); // end ajax
}

function detectFace(path){		

	var url = path;
	var detector = 'Aggressive';
	var attributes = 'all';
			
	$.ajax('http://api.face.com/faces/detect.json',{
		data: {
			'api_key' : api_key,
			'api_secret' : api_secret,
			'urls' : url,
			'detector' : detector,
			'attributes' : attributes
			},
		cache: false,
		dataType: 'json',
		timeout: 10000,
		success: detectSuccess,
		error: detectError
	}); // end ajax
} // detectFace

function detectError() {
	console.log('error: network connection error!');
}
		
function detectSuccess(json){
	var status = json.status;
	
	if (status == 'failure') {
		console.log('error: ' + json.error_code + '->'+ json.error_message);
	} // end if
	
	if (status == 'success') {
		
		// removing detect button
		$('div#detect input').remove();
		
		// getting number of photos and tags		
		var tags = json.photos[0].tags; // array of tags
		var size = tags.length; // number of tags or faces
		console.log('Faces: ' + size); // debuging info
		
		//going through each tag
		$.each(tags, function(ind,val) {
			
			// reading face data
			var tid = val.tid;
			var faceWidth = val.width; // % of image width
			var faceHeight = val.height; // % of image height
			var faceCenterX = val.center.x; // % of image width
			var faceCenterY = val.center.y; // % of image height
			var faceNoseX = val.nose.x; // % of image width
			var faceNoseY = val.nose.y; // % of image height
			
			// reading recognition data
			var uid = "";
			var confidence = 0;
			var numberUids = val.uids.length;
			console.log(numberUids);
			
			if (numberUids != 0) {
				var uid = val.uids[0].uid; // recognized user
				var confidence = val.uids[0].confidence;	// confidence of recognition
			}
			
			// reading image data
			var img = $('div.main img'); //defines img selector
			var imgWidth = img.width(); //image width
			var imgHeight = img.height(); //image height
			var imgPos = img.offset(); // image left top corner coordinates on page
			
			// calculating X and Y for face center		
			var markCenterFaceX = imgPos.left + (imgWidth * faceCenterX / 100);
			var markCenterFaceY = imgPos.top + (imgHeight * faceCenterY / 100);
			
			// calculating X and Y for nose
			var markNoseFaceX = imgPos.left + (imgWidth * faceNoseX / 100);
			var markNoseFaceY = imgPos.top + (imgHeight * faceNoseY / 100);
			
			// calculating Width and Height of face mark
			var markFaceWidth = imgWidth * faceWidth / 100; // face width
			var markFaceHeight = imgHeight * faceHeight / 100; // face height
			
			// calculating X and Y for left top corner of face mark 	
			var markFaceX = markCenterFaceX - markFaceWidth/2; // left position of the mark
			var markFaceY = markCenterFaceY - markFaceHeight/2; // top position of the mark
			
			// creating a new mark
			var id = 'mark' + ind; //builds mark name variable (like mark1)
			$('div#marks').append('<div class="mark"><span class="label"></span></div>'); // creates new div for mark + label
			$('div#marks div').eq(ind).attr('id',id); // sets mark id
			
		
			// positioning this mark
			var mark = $('div#mark' + ind); //defines mark selector
			mark.offset({left: markFaceX, top: markFaceY}).css('width', markFaceWidth).css('height',markFaceHeight); // positions the mark
			$('div#'+ id +' span').offset({left: markFaceX, top: markFaceY - 20}).css('width', markFaceWidth).text(ind); // positions the label
					
			// creating save tag buttons
			var saveId = 'save' + ind;
			var saveVal = 'save face: ' + ind;
			$('div#savetags form').append('<input id="save" type="button"/>');
			$('div#savetags input#save').attr('id', saveId).attr('value', saveVal);
			
			// adding click event on save tag button
			$('div#savetags input#'+saveId).click(function(e){
			e.preventDefault();
			$('div#savetags input').attr('disabled', 'disabled');// disables all save tag buttons to ensure one request at a time
			$(this).attr('id','clicked').attr('value', 'saving...'); // marks clicked
			saveFace(tid,uid); // calls custom function to save tag
			}); //end click save tag button
		
			//debuging info
			console.log('TID: ' + tid);
			console.log('UID: ' + uid);
			console.log('Confidence: ' + confidence);
			console.log('% Face W: ' + faceWidth);
			console.log('% Face H: ' + faceHeight);
			console.log('% Face Center X: ' + faceCenterX);
			console.log('% Face Center Y: ' + faceCenterY);
			console.log('% NoseX: ' + faceNoseX);
			console.log('% NoseY: ' + faceNoseY);
			console.log('ImgPosX: ' + imgPos.left);
			console.log('ImgPosY: ' + imgPos.top);
			console.log('ImgWidth: ' + imgWidth);
			console.log('ImgHeight: ' + imgHeight);
			console.log('markCenterFaceX: ' + markCenterFaceX);
			console.log('markCenterFaceY: ' + markCenterFaceY);
			console.log('markFaceWidth: ' + markFaceWidth);
			console.log('markFaceHeight: ' + markFaceHeight);
			console.log('markFaceX: ' + markFaceX);
			console.log('markFaceY: ' + markFaceY);
		}); // end of each
	} // end if
} // end detectSuccess
		
function saveFace(tid,uid) {
	
	// defining UID and label
	var pos1 = 0;
	var pos2 = uid.search('@');
	var uid = uid.slice(pos1,pos2);
	var uid = prompt("User:", uid);
	if (uid == null) {
		var uid = "";
	}
	var uid = uid + '@' + namespace;
	var label = ""; //prompt("Label:");
	
	// calling face.com
	$.ajax('http://api.face.com/tags/save.json',{
		data: {
			'api_key' : api_key,
			'api_secret' : api_secret,
			'tids' : tid,
			'uid' : uid,
			'label' : label
			},
		cache: false,
		dataType: 'json',
		timeout: 10000,
		success: saveSuccess,
		error: saveError
	}); // end ajax
} // end saveFace

function saveError() {
	console.log('error: network connection error!');
}

function saveSuccess (json) {
  	
  	var status = json.status;
	
	// performing actions based on status
	if (status == 'failure') {
		// enabling save button to try again
		$('div#savetags input#clicked').attr('value', 'try again').removeAttr('disabled');
		console.log('error: ' + json.error_code + '->'+ json.error_message);
	} // end if
	
	if (status == 'success') {
  	
  		// extracting UID from success message
		var message = json.message;
		var pos1 = message.search('uid:');
		var pos2 = message.search('@');
		var uid = message.slice(pos1+5,pos2);
  	
  		// disabling save tag button and chaning its value
  		$('div#savetags input#clicked').attr('disabled','disabled').attr('id','saved').attr('value','saved');
  	
  		// calling train face function
  		trainFace(uid);
  	
  		// debuging info
  		console.log('Saved: ' + message);
  		console.log('UID: '+ uid);
  	} // end if
}

function trainFace(uid){		

	$.ajax('http://api.face.com/faces/train.json',{
		data: {
			'api_key' : api_key,
			'api_secret' : api_secret,
			'uids' : uid,
			'namespace' : namespace
			},
		cache: false,
		dataType: 'json',
		timeout: 10000,
		success: trainSuccess,
		error: trainError
	}); // end ajax
}

function trainError() {
	console.log('error: network connection error!');
}

function trainSuccess (json) {
  	
  	var status = json.status;
	
	// performing actions based on status
	if (status == 'failure') {
		console.log('error: ' + json.error_code + '->'+ json.error_message);
	} // end if
	
	if (status == 'success') {
  	
  		// enabling save tag buttons except for the clicked one
  		$('div#savetags input#saved').attr('id', 'trained').attr('value', 'trained');
  		$('div#savetags input').removeAttr('disabled');
  		$('div#savetags input#trained').attr('disabled','disabled');
  		
  		// debuging info
  		console.log('Trained!');
  	} // end if
}