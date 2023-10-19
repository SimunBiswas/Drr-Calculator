import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
import "./App.css";
import {
  addData,
  deleteData,
  setLoading,
  setError,
  setLeadCount,
  setDaysOfCount,
} from "./redux/dataSlice";

function getSundaysBetween(startDate, endDate) {
  // Copy the start date to avoid modifying the original date
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  const sundays = [];

  // Loop through each day between start and end dates
  while (currentDate <= end) {
    // Check if the current day is a Sunday (0 corresponds to Sunday)
    if (currentDate.getDay() === 0) {
      sundays.push(new Date(currentDate)); // Add a new Date object to the array
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sundays;
}

const MyForm = () => {
  const [formData, setFormData] = useState({
    leadCount: "",
    daysOfCount: 0,
  });
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.data);
  const daysOfCount = useSelector((state) => state.data.daysOfCount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch("https://your-netlify-site.netlify.app/.netlify/functions/server");
        const newData = await response.json();

        const processedData = newData.map((item) => {
          return {
            ...item,
            numberOfDays: calculateNumberOfDays(item.startDate, item.endDate),
            expectedDRR: calculateExpectedDRR(item.leadCount, daysOfCount),
          };
        });

        dispatch(addData(processedData));

        // Calculate and set leadCount by summing up leadCount for all items
        const totalLeadCount = processedData.reduce(
          (total, item) => total + parseFloat(item.leadCount),
          0
        );
        dispatch(setLeadCount(totalLeadCount));
      } catch (error) {
        console.error("Error fetching data:", error);
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch, daysOfCount]);

  const handleStartDateChange = (e) => {
    const { value } = e.target;
    setDates({ ...dates, startDate: value });

    if (dates.endDate) {
      const numberOfDays = calculateNumberOfDays(value, dates.endDate);
      setFormData({ ...formData, numberOfDays });
      dispatch(setDaysOfCount(numberOfDays));
    }
  };

  const handleEndDateChange = (e) => {
    const { value } = e.target;
    setDates({ ...dates, endDate: value });

    if (dates.startDate) {
      const numberOfDays = calculateNumberOfDays(dates.startDate, value);
      setFormData({ ...formData, numberOfDays });
      dispatch(setDaysOfCount(numberOfDays));
    }
  };

  const handleLeadCountChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, leadCount: value });

    const expectedDRR = calculateExpectedDRR(value, daysOfCount);
    setFormData({ ...formData, leadCount: value, expectedDRR });
    dispatch(setLeadCount(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any of the required fields is empty
    if (
      !formData.leadCount ||
      !formData.numberOfDays ||
      !dates.startDate ||
      !dates.endDate ||
      isNaN(formData.expectedDRR)
    ) {
      // You can handle this case (show an error message, etc.)
      console.error("Please fill in all required fields with valid values.");
      return;
    }
    if (!formData.expectedDRR || isNaN(formData.expectedDRR)) {
      console.error(
        "DRR is not calculated. Please make sure to enter valid leadCount."
      );
      return;
    }

    try {
      dispatch(setLoading(true));

      // Make the API call
      const response = await fetch("/.netlify/functions/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...dates, id: nanoid() }),
      });

      const newData = await response.json();
      dispatch(addData(newData));
      dispatch(setLeadCount(newData.leadCount));

      // Clear the form data
      setFormData({ leadCount: "", daysOfCount: "", numberOfDays: "" });
      setDates({ startDate: "", endDate: "" });
    } catch (error) {
      console.error("Error submitting data:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(setLoading(true));
      await fetch(
        `https://your-netlify-site.netlify.app/.netlify/functions/server/api/data/${id}`,
        { method: "DELETE" }
      );
      dispatch(deleteData(id));
    } catch (error) {
      console.error("Error deleting data:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const calculateNumberOfDays = (startDate, endDate) => {
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    while (currentDate <= end) {
      if (currentDate.getDay() !== 0) {
        count++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const calculateExpectedDRR = (leadCount, daysOfCount) => {
    const expdrr = leadCount / daysOfCount;
    return !isNaN(expdrr) ? parseFloat(expdrr).toFixed(2) : "";
  };
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString("en-IN") : "";
  };
  return (
    <form onSubmit={handleSubmit}>
      <br />
      <div>
        {data.length > 0 && (
          <table>
            <caption>DRR Calculator</caption>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Number of Days</th>
                <th>Sundays</th>

                <th>Lead Count</th>

                <th>DRR</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Start Date">
                  <input
                    type="date"
                    value={dates.startDate}
                    onChange={handleStartDateChange}
                    name="startDate"
                    required
                  />
                </td>
                <td data-label="End Date">
                  <input
                    type="date"
                    value={dates.endDate}
                    onChange={handleEndDateChange}
                    name="endDate"
                    required
                  />
                </td>
                <td data-label="Number of Days">
                  <input
                    type="number"
                    name="daysOfCount"
                    value={formData.numberOfDays}
                    readOnly
                  />
                </td>
                <td data-label="Sundays">
                  <span></span>
                </td>
                <td data-label="Lead Count">
                  <input
                    type="number"
                    name="leadCount"
                    value={formData.leadCount}
                    onChange={handleLeadCountChange}
                    required
                  />
                </td>
                <td data-label="Expected DRR">
                  <input
                    type="text"
                    id="expectedDRR"
                    value={formData.expectedDRR}
                    readOnly
                  />
                </td>
                <td>
                  <button type="submit">Submit</button>
                </td>
              </tr>
              {data.map((item) => (
                <tr key={item.id}>
                  <td data-label="Start Date">{formatDate(item.startDate)}</td>
                  <td data-label="End Date">{formatDate(item.endDate)}</td>
                  <td data-label="Number of Days">
                    {item.startDate && item.endDate && !isNaN(item.numberOfDays)
                      ? item.numberOfDays
                      : ""}
                  </td>
                  <td data-label="Sundays">
                    {getSundaysBetween(item.startDate, item.endDate)
                      .map((date) => formatDate(date))
                      .join(", ")}
                  </td>
                  <td data-label="Lead Count">{item.leadCount}</td>
                  <td data-label="Expected DRR">{item.expectedDRR}</td>
                  <td data-label="Last-updated">
                    {new Date().toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </td>

                  <td>
                    <button type="button" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </form>
  );
};

export default MyForm;
