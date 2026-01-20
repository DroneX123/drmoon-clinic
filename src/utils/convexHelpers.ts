// Helper to group services by category for the booking page
export const groupServicesByCategory = (services: any[]) => {
    const categories = ['Visage', 'Corps', 'Peau'];

    return categories.map((cat) => ({
        id: cat.toLowerCase(),
        title: cat,
        treatments: services
            .filter((s) => s.category.toLowerCase() === cat.toLowerCase())
            .map((s) => ({
                name: s.name,
                price: s.price === 0 ? 'Offert' : `${s.price.toLocaleString('fr-FR')} DA`,
                duration: `${s.duration_minutes} min`,
                description: s.description, // Now includes description!
                _id: s._id,
            })),
    }));
};

// Format date for Convex
export const formatDateForConvex = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
