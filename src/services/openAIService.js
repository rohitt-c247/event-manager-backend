import axios from 'axios'

export const generateTextByAI = async (prompt) => {
    try {
        const response = await axios.post(
            process.env.GENERATOR_ENDPOINT, // Replace with the desired model
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GENERATOR_TOKEN}`, // Optional, for higher limits
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data[0].generated_text;
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
};
