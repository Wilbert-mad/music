const config = require("./config.json");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const prefix = config.PREFIX;

const servers = {};

client.login(config.TOKEN);

client.on("ready", () => {
	console.log(`${client.user.tag} Is Ready`)
});

client.on("message", message => {
	if(message.author.bot || message.channel.type === "dm") return;

	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	let args = messageArray.slice(1);

	if(!cmd.startsWith(prefix)) return;

	if(cmd === `${prefix}play`) {

		function play(connection, message){
				var server = servers[message.guild.id];

				server.dispatcher = connection.play(ytdl(server.queue[0], { filter: 'audioonly' }));

				server.queue.shift();

				server.dispatcher.on("end", function() {
					if(server.queue[0]) {
						connection.play(connection, message)
					}
					else {
						connection.disconnect()
					}
				})
		}

		if(!args[0]){
			return message.channel.send("You need to provid a link");
		}

		if(!message.member.voice.channel){
			return message.channel.send("You need to be in a voiceChannel!");
		}

		if(!servers[message.guild.id]) servers[message.guild.id] = {
			queue: []
		}

		var server = servers[message.guild.id];

		server.queue.push(args[0])

		if(!message.guild.voice) message.member.voice.channel.join()
			.then(function(connection){play(connection, message)})
			.catch(console.error);
	}

	if(cmd === `${prefix}stop`) {
		var server = servers[message.guild.id];
		 if(message.guild.voice) {
		 	for(var i = server.queue - 1; i >= 0; i--) {
		 		server.queue.splice(i, 1)
		 	}
		 	server.dispatcher.end();
		 	console.log("stoped playing music")
		 }
		if(message.guild.connection) message.guild.voiceConnection.disconnect();
	}
});