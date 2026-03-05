// LoadingSpinner.tsx
import "./LoadingSpinner.css"
export const LoadingSpinner = ({ size = 40 }: { size?: number }) => {
    return (
        <div
            className="internet-loader"
            style={{
                width: size,
                height: size
            }}
        />
    );
};
