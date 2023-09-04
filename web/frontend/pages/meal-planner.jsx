import React, { useState, useEffect } from 'react';
import { Card, Form, FormLayout, Select, TextField, Button } from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks';
import axios from 'axios';
import { useAppBridge } from '@shopify/app-bridge-react';

const MealPlan = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    days: {
      dayOfWeek: '',
      meals: {
        breakfast: '',
        lunch: '',
        dinner: '',
        snack: '',
      },
    },
  });
  

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const app = useAppBridge();
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    // Set the clientId in formData to the shopOrigin when the component mounts
    setFormData((prevData) => ({
      ...prevData,
      clientId: app.shopOrigin,
    }));
  }, [app.shopOrigin]);
  const semidata = {
    hel:"hey"
  }
  const handleSubmit = async () => {
    try {
      // Make the POST request to your backend API using the authenticated fetch function
      const response = await fetch('/api/meals/plan', {
        method: 'POST',
        body: JSON.stringify(semidata),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Process the response here if needed
      console.log(response);
    } catch (error) {
      // Handle errors here if needed
      console.error(error);
    }
  };

  const daysOfWeek = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];

  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <Select
            label="Day of Week"
            options={daysOfWeek}
            onChange={(value) => handleChange('dayOfWeek', value)}
            value={formData.dayOfWeek}
            required
          />

          <TextField
            label="Breakfast"
            value={formData.breakfast}
            onChange={(value) => handleChange('breakfast', value)}
            required
          />
   
          <TextField
            label="Lunch"
            value={formData.lunch}
            onChange={(value) => handleChange('lunch', value)}
            required
          />

          <TextField
            label="Dinner"
            value={formData.dinner}
            onChange={(value) => handleChange('dinner', value)}
            required
          />

          <TextField
            label="Snack"
            value={formData.snack}
            onChange={(value) => handleChange('snack', value)}
            required
          />

          <Button submit>Save Meal Plan</Button>
        </FormLayout>
      </Form>
    </Card>
  );
};

export default MealPlan;
