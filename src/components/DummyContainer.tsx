interface ContainerProps {
  name: string;
}

const DummyContainer: React.FC<ContainerProps> = ({ name }) => (
  <div className="flexBox">
    <h3>{name}</h3>
  </div>
);

export default DummyContainer;
