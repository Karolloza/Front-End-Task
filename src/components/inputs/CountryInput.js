import React from 'react'
import Loader from '../loader/Loader'
import './CountryInput.scss'

const availableCountries = ['Poland', 'Germany', 'Spain', 'France']

class CountryInput extends React.Component {
    state = ({
        selectedCountry: localStorage.getItem('country'),
        countries: [],
        cities: [],
        showMore: 'show more',
        background: '',
        descriptions: {}
    })

    mostPollutedCities = (country, amount = 10) => {
        country && this.state.countries.filter((el) => {
            if(el.name === country.charAt(0).toUpperCase() + country.slice(1)) {
                fetch(`https://api.openaq.org/v1/cities?country=${el.code}`)
                    .then(res => res.json())
                    .then(data => {
                        const sorted = data.results.sort(function(a, b){return b.count - a.count})
                        for(let i = 0; i < amount; i++) {
                            if(i < sorted.length) {
                                this.setState( prevState => ({
                                    cities: [...prevState.cities, sorted[i]]
                                }))
                            }
                        }
                        }
                    )
            }
        })
    }

    handleShowDescription = (e, el) => {
        e.target.nextElementSibling.classList.toggle('descriptionVisible');
        e.target.innerText = e.target.innerText === this.state.showMore ? 'hide' : this.state.showMore;
        e.target.innerText !== this.state.showMore && fetch(`https://pl.wikipedia.org/w/api.php?action=query&titles=${el.city}&prop=description&format=json&origin=*`)
            .then(res => res.json())
            .then(data => {
                let pageId = Object.keys(data.query.pages)[0];
                this.setState(prevState => ({
                    descriptions: {
                        ...prevState.descriptions,
                        [data.query.pages[pageId].title]: data.query.pages[pageId].description || 'no description'
                    }
                }))
            })
    }

    handleShowCities = () => {
        this.setState({
            cities: [],
            selectedCountry: this.refs.countryInput.value
        })
        localStorage.setItem('country', this.refs.countryInput.value)
        this.mostPollutedCities(this.refs.countryInput.value)
    }

    handleEnterPress = (e) => {
        if (e.key === 'Enter') {
            this.handleShowCities()
        }
    }

    componentDidMount() {
        fetch('https://api.openaq.org/v1/countries')
            .then(res => res.json())
            .then(data => this.setState({
                countries: data.results
            }))
    }

    render() {
        const {
            cities,
            showMore,
            descriptions,
            selectedCountry
        } = this.state

        return (
            <div tabIndex={0} onKeyDown={(e) => this.handleEnterPress(e)}>
                <div >
                    <div className='title'>
                        <h1>Select country and submit</h1>
                    </div>
                    <div className='search'>
                        <select ref='countryInput'>
                            {
                                    this.state.countries && this.state.countries.map((el) => {
                                        if(availableCountries.includes(el.name)) {
                                        return <option value={el.name} selected={el.name === selectedCountry ? 'selected' : false} key={el.code}>{el.name}</option>
                                    } else {
                                        return <option value={el.name} key={el.code} disabled>{el.name}</option>
                                    }
                                })
                            }
                        </select>
                        <input
                            type='button'
                            value='Submit'
                            onClick={() => this.handleShowCities()}
                            className='searchBtn'
                        />
                    </div>

                </div>
                <div>
                    <ul>
                        {
                            cities && cities.map((el) => {
                                return (
                                <li key={el.city}>
                                    <span className='cityName'><b>{el.city}</b> have <b>{el.count}</b> citizens</span>
                                    <span
                                        onClick={(e) => this.handleShowDescription(e, el)}
                                        className='descriptionBtn'>
                                        {showMore}
                                    </span>
                                    <div className='descriptionText' ref='comment'>
                                        { descriptions[el.city] || <Loader /> }
                                    </div>
                                </li>
                                )})
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

export default CountryInput
