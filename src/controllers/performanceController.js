const axios = require('axios');
const Metric = require('../models/Performance');

exports.getAllMetrics = async (req, res, next) => {
  try {
    const metrics = await Metric.findAll();
    res.status(200).json({ count: metrics.length, configs });
  } catch (error) {
    next(error);
  }
};

exports.createMetric = async (req, res, next) => {
  try {
    const { performance_id, model_used, metric_count, accuracy, avg_response_time, session_time } = req.body;
    const metrics = new Metric(performance_id, model_used, metric_count, accuracy, avg_response_time, session_time);
    await metrics.save();
    res.status(201).json({ message: "Metric created" });
  } catch (error) {
    next(error);
  }
};

exports.getMetricById = async (req, res, next) => {
  try {
    const metricId = req.params.id;
    const metric = await Metric.findById(metricId);
    res.status(200).json({ metric })
  } catch (error) {
    next(error);
  }
};

exports.updateMetricById = async (req, res, next) => {
  try {
    const metricId = req.params.id;
    const { performance_id, model_used, metric_count, accuracy, avg_response_time, session_time } = req.body;
    const metric = new Metric(performance_id, model_used, metric_count, accuracy, avg_response_time, session_time);
    metric.id = metricId;
    await metric.update();
  } catch (error) {
    next(error);
  }
};

exports.deleteMetricById = async (req, res, next) => {
  try {
    const metricId = req.params.id;
    await Metric.deleteById(metricId);
  } catch (error) {
    next(error);
  }
};

