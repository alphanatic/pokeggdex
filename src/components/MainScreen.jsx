import DexPage from './DexPage.jsx'

// The big display on the left half, in its grey bezel.
export default function MainScreen(props) {
  return (
    <div className="bezel">
      <div className="bezel-dots">
        <span /><span />
      </div>
      <div className="screen main-screen"><DexPage {...props} /></div>
      <span className="speaker" />
    </div>
  )
}
