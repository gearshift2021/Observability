// Imports necessary for OpenTelemetry tracing
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base"); // Use BatchSpanProcessor for Jaeger
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");

// Import the JaegerExporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Function to setup tracing
module.exports = (serviceName) => {
    // Configure Jaeger Exporter
    const options = {
        host: 'localhost',
        port: 6832,
        maxPacketSize: 65000
    };
    const exporter = new JaegerExporter(options);

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // Use BatchSpanProcessor for better performance with Jaeger
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();

    // Register instrumentations
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};
