package matrix;

import io.vertx.core.Vertx;

public class Launcher {
	public static void main(String[] args) {
		Vertx vertx = Vertx.vertx();
		var service = new Broker(20000);
		vertx.deployVerticle(service);		
	}

}
