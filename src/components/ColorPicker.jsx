import { SketchPicker } from "react-color";

const ColorPicker = ({ color, onChange }) => {
  return (
    <div>
      <div
        style={{
          backgroundColor: color,
          height: "20px",
          width: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            textAlign: "center",
            paddingTop: "0px",
            marginLeft: "40px",
            color: "#000",
          }}
        >
          {color}
        </p>
      </div>
      <SketchPicker color={color} onChange={(color) => onChange(color.hex)} />
    </div>
  );
};

export default ColorPicker;
