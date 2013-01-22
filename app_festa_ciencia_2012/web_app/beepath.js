$(function() {	
			var device ="";
			var lat = 0.0;
			var lon = 0.0;
			var gpsAccuracy = 0.0;
			var id_user = '';
			
			// form variables
			var lang = "";
			var gender = "";
			var age = "";
			var move = "";
			var startExperiment = false;
			var email = "";
			var counterPositionsSend = 0;
			var alone ="";
			var startTimestamp = 0;
			var lastGpsUpdate = 0;
			var wpid;
			var termsTranslations;
			//var langArray = {'ca','es','en'}
			
			$(document).ready(function() {
			   	detectDevice();
				getGPSPosition();
				
				// cookie to get saved variables
				id_user = $.cookie("id_user");
				lang = $.cookie("lang");
				startExperiment = $.cookie("startExperiment");
				
				if(startExperiment && navigator.geolocation){
					wpid = navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
				}
				
			});
			
			function detectDevice() {
				var ua = navigator.userAgent.toLowerCase();
				if( ua.indexOf("iphone")>-1 ) {
					device ="iphone";
				}else if(ua.indexOf("ipad")>-1){
					device ="ipad";
				}else if(ua.indexOf("android") > -1){
					device ="android";
				}else if(ua.indexOf("blackberry")> -1){
					device ="blackberry";
				}else{
					device = ua;
				}
			}
       	
			function changePageToRegistration(){
				$("#registrationPage").bind("callback", function(e, args) {
				    alert(args.mydata);
				});
       	
				$.mobile.changePage( $("#registrationPage"), "slide", true, true);
				$("page").trigger("callback");
			}
       	
			function validateEmail(email) { 
			  // http://stackoverflow.com/a/46181/11236
			    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
			}
       	
			function validarEmail() {
			  email = $("#email-"+lang).val();
			  $.cookie("email",email);
			  if( validateEmail(email) ){
				 $(".emailError").hide();
			  }else{
				 $(".emailError").show();
			  }
			}
						
			function geo_success(location) {
				lat = location.coords.longitude;
				lon = location.coords.latitude;
				gpsAccuracy= location.coords.accuracy;
			}
			
			function geo_error(error)
			{
			}
       	
			function getGPSPosition(){
			   	setTimeout(getGPSPosition,1000);
				/*
       			if(id_user=="" && lang=="" || (startExperiment==false) ){
					$.mobile.changePage("#languagePage", "slide");
				}else
				*/
				if(id_user!="" && lang!="" && startExperiment){
					$.mobile.changePage("#sendPositionPage-"+lang, "slide");
				}
				
				if(startExperiment){
					var timestamp = Math.round((new Date()).getTime() / 1000);
					var timeStampSinceStart = startTimestamp-timestamp;
					//timeStampSinceStart
					if((timestamp-lastGpsUpdate)>15){
						lastGpsUpdate = timestamp;
       	
						if( navigator.geolocation ){
							$("#latDisplay-"+lang).html(lat);
							$("#lonDisplay-"+lang).html(lon);
							$("#accuracyDisplay-"+lang).html(Math.round(gpsAccuracy));
							$("#currentGPSDataDisplay").show();
							$("#currentGPSDataDisplayError").hide();
							// send data to server
							var dataString = 'a=newPosition&lat='+ lat+ '&lon=' + lon + '&timestamp=' + timestamp+'&gps_accuracy='+gpsAccuracy+'&id_user='+id_user+'';  
							//alert(dataString); 
							$.ajax({  
							  type: "POST",  
							  url: "../api/api.php",
							  cache: false,  
							  data: dataString,  
							  success: function(data) {  
							     //alert("response server:"+data);
								 counterPositionsSend +=1;
							  }  
							});
						}else{
							$("#currentGPSDataDisplay").hide();
							$("#currentGPSDataDisplayError").show();
						}
					}
				}
			}
       	
			function finishExperiment(){
				var answer = confirm("Confirm you want to finish")
				if (answer){
					var timestamp = Math.round((new Date()).getTime() / 1000);
					var dataString = 'a=endsession&timestamp='+timestamp+'&id_user='+id_user+'&lang='+lang;   
					$.ajax({  
				  		type: "POST",  
				  		url: "../api/api.php", 
						cache: false, 
				  		data: dataString,  
				  		success: function(data) {
							startExperiment =  false;
							$.cookie("startExperiment",startExperiment);
							$.mobile.changePage("#creditsPage-"+lang, "slide");
				  		}  
					});
				}
			}

			function sendFormToServer(){
				// getting data from registry form
				gender = $('input[name=radio-gender-'+lang+']:checked', '#myForm-'+lang).val();
				$.cookie("gender",gender);
				age = $('input[name=radio-age-'+lang+']:checked', '#myForm-'+lang).val();
				$.cookie("age",age);
				move = $('input[name=radio-move-'+lang+']:checked', '#myForm-'+lang).val();
				$.cookie("move",move);
				alone = $('input[name=radio-alone-'+lang+']:checked', '#myForm-'+lang).val();
				
				// hide all before look if there is any error
				$(".genderError").hide();
				$(".ageError").hide();
				$(".moveError").hide();
				$(".emailError").hide();
				
				// looking for errors
				var errors = false;
				if( age=="" ||  age==undefined){
					errors = true;
					$(".ageError").show();
				}	
				if( gender=="" || gender==undefined ){
					errors = true;
					$(".genderError").show();
				}
				if( move=="" || move==undefined ){
					errors = true;
					$(".moveError").show();
				}
				if( !validateEmail(email) ){
					errors = true;
					$(".emailError").show();
				}
				
				
				// if there is not error send form and change page
				if(!errors){
					var dataString = 'a=newuser&email='+email+'&age_group='+age+'&gender='+gender+'&mobile_platform='+device+'&move_alone='+alone+'&kind_movement='+move+'&lang='+lang;
					$.ajax({  
					  	type: "POST",  
					  	url: "../api/api.php",
					    cache: false,
					  	data: dataString,  
						success: callback_prepareExperiment
					});
				} 	
			}

			function callback_prepareExperiment(data){
				id_user = data.split("=")[1];
				
				startTimestamp = Math.round((new Date()).getTime() / 1000);
				var dataString = 'a=startsession&timestamp='+startTimestamp+'&id_user='+id_user+'';  
				
				$.ajax({  
			  		type: "POST",  
			  		url: "../api/api.php", 
			  		data: dataString,  
			  		success: callback_startExperiment
				});
			}
			
			function callback_startExperiment(data){
				startExperiment =  true;
				$.cookie("startExperiment",startExperiment);
				counterPositionsSend = 0;
		    	$.mobile.changePage("#sendPositionPage", "slide");
				// allow to get gps data
				if(navigator.geolocation){
					wpid = navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
				}
			}
			
			$(".home-link").click(function() {
				startExperiment = false;
				$.cookie("startExperiment",false);
				$.cookie("email","");
				$.cookie("lang","");
			});
		    // event de email
			$(".emailInput").focusout(function() {
				validarEmail();
			});
			
			// buttons to change pages
			$(".changePageToCredits").click(function() {
				finishExperiment();
			});
            
			$(".callAjaxFormRegistration").click(function() {
				sendFormToServer();
		    });
            
			$(".changePageToRegistration").click(function() {
				$.mobile.changePage("#registrationPage-"+lang, "slide");
		    });
			
			// translation
			$("#changePageToInformation-ca").click(function() {
				lang = "ca";
				$.cookie("lang",lang);
				$.mobile.changePage("#infoPage-"+lang, "slide");
	        });
	
			$("#changePageToInformation-es").click(function() {
				lang = "es";
				$.cookie("lang",lang);
				$.mobile.changePage("#infoPage-"+lang, "slide");
	        });
	
			$("#changePageToInformation-en").click(function() {
				lang = "en";
				$.cookie("lang",lang);
				$.mobile.changePage("#infoPage-"+lang, "slide");
	        });
		});