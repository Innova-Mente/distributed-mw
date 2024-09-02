package matrix;

import java.util.logging.Level;
import java.util.logging.Logger;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.*;

public class Broker extends AbstractVerticle {

	private int port;
	static Logger logger = Logger.getLogger("[Broker]");
	static String PIXEL_GRID_CHANNEL = "pixel-grid-events";
	
	public Broker(int port) {
		this.port = port;
		logger.setLevel(Level.INFO);
	}

	public void start() {
		logger.log(Level.INFO, "Broker initializing...");
		HttpServer server = vertx.createHttpServer();
	
		server.webSocketHandler(ws -> {
			// if (webSocket.path().equals(path)) {
				ws.accept();
				logger.log(Level.INFO, "New connection accepted.");

				ws.textMessageHandler(msg -> {
					logger.log(Level.INFO, "msg arrived: \n" + msg);					
					//JsonObject wsmsg = new JsonObject(msg);					
					//String payload  = wsmsg.getString("mess");
					JsonObject jmsg = new JsonObject(msg);
					String cmd = jmsg.getString("cmd");
					
					if (cmd.equals("subscribe")) {
						String topic = jmsg.getString("topic");
						logger.log(Level.INFO, "New subscription \n- topic " + topic + "\n- ws-URI " + ws.uri() + "\n- ws: " + ws);
						EventBus eb = vertx.eventBus();
						eb.consumer(topic, msgOnTopic -> {
							JsonObject ev = (JsonObject) msgOnTopic.body();
							ws.writeTextMessage(ev.encodePrettily());
						});
						
					} else if (cmd.equals("publish")) {
						String topic = jmsg.getString("topic");
						JsonObject mpayload = jmsg.getJsonObject("msg");
						logger.log(Level.INFO, "Publish msg \n- topic " + topic + " \n- msg " + mpayload);
						EventBus eb = vertx.eventBus();
						eb.publish(topic, mpayload);
					}
					
				});
		});
		
		server.requestHandler(request -> {

			    Future<ServerWebSocket> fut = request.toWebSocket();
			    fut.onSuccess(ws -> {
					ws.accept();
					logger.log(Level.INFO, "New connection.");

					ws.textMessageHandler(msg -> {
						JsonObject jmsg = new JsonObject(msg);
						String cmd = jmsg.getString("cmd");
						if (cmd.equals("subscribe")) {
							String topic = jmsg.getString("topic");
							logger.log(Level.INFO, "New subscription - topic " + topic + " ws " + ws.uri());
							EventBus eb = vertx.eventBus();
							eb.consumer(topic, msgOnTopic -> {
								JsonObject ev = (JsonObject) msgOnTopic.body();
								ws.writeTextMessage(ev.encodePrettily());
							});
						} else if (cmd.equals("publish")) {
							String topic = jmsg.getString("topic");
							JsonObject mpayload = jmsg.getJsonObject("msg");
							logger.log(Level.INFO, "Publish msg - topic " + topic + " msg " + mpayload);
							EventBus eb = vertx.eventBus();
							eb.publish(topic, mpayload);
						}						
					});
			    });

			});		
		
		/* start the server */
		
		server
		.listen(port);

		logger.log(Level.INFO, "Broker ready - port: " + port);
	}

	/* Aux methods */
	

	private void sendReply(HttpServerResponse response, JsonObject reply) {
		response.putHeader("content-type", "application/json");
		response.end(reply.toString());
	}
	
	private void sendBadRequest(HttpServerResponse response, JsonObject reply) {
		response.setStatusCode(400);
		response.putHeader("content-type", "application/json");
		response.end(reply.toString());
	}

	private void sendServiceError(HttpServerResponse response) {
		response.setStatusCode(500);
		response.putHeader("content-type", "application/json");
		response.end();
	}

}
